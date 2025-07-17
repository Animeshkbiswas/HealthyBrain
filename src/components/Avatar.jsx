import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useFBX, useAnimations } from "@react-three/drei";
import * as THREE from "three";

export default function Avatar({
  audioUrl,
  animationCue,
  headFollow = true,
  smoothMorphTarget = true,
  morphTargetSmoothing = 0.5,
  ...props
}) {
  // Load the GLTF model
  const { nodes, materials } = useGLTF("/models/646d9dcdc8a5f5bddbfac913.glb");

  // Load FBX animations and check existence before naming
  const { animations: idleAnims } = useFBX("/animations/Idle.fbx");
  const { animations: angryAnims } = useFBX("/animations/Angry Gesture.fbx");
  const { animations: greetAnims } = useFBX("/animations/Standing Greeting.fbx");
  if (idleAnims[0]) idleAnims[0].name = "Idle";
  if (angryAnims[0]) angryAnims[0].name = "Angry";
  if (greetAnims[0]) greetAnims[0].name = "Greeting";

  // Manage current animation state
  const [animation, setAnimation] = useState("Idle");
  const group = useRef();
  const { actions } = useAnimations(
    [idleAnims[0], angryAnims[0], greetAnims[0]].filter(Boolean),
    group
  );

  // Play the correct animation whenever `animation` changes
  useEffect(() => {
    if (actions && actions[animation]) {
      actions[animation].reset().fadeIn(0.5).play();
    }
    return () => {
      if (actions && actions[animation]) {
        actions[animation].fadeOut(0.5);
      }
    };
  }, [animation, actions]);

  // Respond to external `animationCue` prop
  useEffect(() => {
    if (animationCue && actions && actions[animationCue]) {
      setAnimation(animationCue);
    }
  }, [animationCue, actions]);

  // --- LIPSYNC SECTION BELOW ---
  const audioRef = useRef();
  const rafRef = useRef();
  const audioCtxRef = useRef();
  const analyserRef = useRef();
  const mouthViseme = "viseme_AA"; // The correct viseme morph for mouth open (change if your model uses a different one!)

  // Realtime lipsync: open mouth by amplitude while audio is playing
  useEffect(() => {
    if (!audioUrl || !nodes.Wolf3D_Head || !nodes.Wolf3D_Teeth) return;
    // Pause previous audio if playing
    if (audioRef.current) audioRef.current.pause();

    // Setup audio
    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    let mouthIdxHead = nodes.Wolf3D_Head.morphTargetDictionary[mouthViseme];
    let mouthIdxTeeth = nodes.Wolf3D_Teeth.morphTargetDictionary[mouthViseme];
    if (mouthIdxHead === undefined) mouthIdxHead = 0;
    if (mouthIdxTeeth === undefined) mouthIdxTeeth = 0;

    // Lipsync using Web Audio API
    let ctx = null;
    let src = null;
    let analyser = null;
    let data = null;
    let isMounted = true;

    function animate() {
      if (!isMounted) return;
      analyser.getByteFrequencyData(data);
      // Use the average as crude "volume"
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      // Scale value between 0-1
      const mouth = Math.min(avg / 90, 1);

      if (smoothMorphTarget) {
        nodes.Wolf3D_Head.morphTargetInfluences[mouthIdxHead] =
          THREE.MathUtils.lerp(
            nodes.Wolf3D_Head.morphTargetInfluences[mouthIdxHead], mouth, morphTargetSmoothing
          );
        nodes.Wolf3D_Teeth.morphTargetInfluences[mouthIdxTeeth] =
          THREE.MathUtils.lerp(
            nodes.Wolf3D_Teeth.morphTargetInfluences[mouthIdxTeeth], mouth, morphTargetSmoothing
          );
      } else {
        nodes.Wolf3D_Head.morphTargetInfluences[mouthIdxHead] = mouth;
        nodes.Wolf3D_Teeth.morphTargetInfluences[mouthIdxTeeth] = mouth;
      }
      rafRef.current = requestAnimationFrame(animate);
    }

    audio.onplay = () => {
      ctx = new window.AudioContext();
      src = ctx.createMediaElementSource(audio);
      analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      src.connect(analyser);
      analyser.connect(ctx.destination);
      data = new Uint8Array(analyser.frequencyBinCount);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      animate();
    };

    audio.onended = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (ctx) ctx.close();
      if (nodes.Wolf3D_Head) nodes.Wolf3D_Head.morphTargetInfluences[mouthIdxHead] = 0;
      if (nodes.Wolf3D_Teeth) nodes.Wolf3D_Teeth.morphTargetInfluences[mouthIdxTeeth] = 0;
      setAnimation("Idle");
    };

    audio.play();

    return () => {
      isMounted = false;
      audio.pause();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioCtxRef.current) audioCtxRef.current.close();
      if (nodes.Wolf3D_Head) nodes.Wolf3D_Head.morphTargetInfluences[mouthIdxHead] = 0;
      if (nodes.Wolf3D_Teeth) nodes.Wolf3D_Teeth.morphTargetInfluences[mouthIdxTeeth] = 0;
    };
  // Only run when audioUrl changes
  }, [audioUrl, nodes, smoothMorphTarget, morphTargetSmoothing]);

  // --- END LIPSYNC ADDITION ---

  // Make the head follow the camera if enabled
  useFrame((state) => {
    if (headFollow && group.current) {
      const candidateNames = ["Head", "Wolf3D_Head", "Wolf3D_Head_2"];
      let head = null;
      for (let name of candidateNames) {
        head = group.current.getObjectByName(name);
        if (head) break;
      }
      if (head && typeof head.lookAt === "function") {
        head.lookAt(state.camera.position);
      }
    }
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={nodes.Hips} />
      <skinnedMesh
        geometry={nodes.Wolf3D_Body.geometry}
        material={materials.Wolf3D_Body}
        skeleton={nodes.Wolf3D_Body.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
        material={materials.Wolf3D_Outfit_Bottom}
        skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
        material={materials.Wolf3D_Outfit_Footwear}
        skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Outfit_Top.geometry}
        material={materials.Wolf3D_Outfit_Top}
        skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
      />
      <skinnedMesh
        geometry={nodes.Wolf3D_Hair.geometry}
        material={materials.Wolf3D_Hair}
        skeleton={nodes.Wolf3D_Hair.skeleton}
      />
      <skinnedMesh
        name="EyeLeft"
        geometry={nodes.EyeLeft.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeLeft.skeleton}
        morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
      />
      <skinnedMesh
        name="EyeRight"
        geometry={nodes.EyeRight.geometry}
        material={materials.Wolf3D_Eye}
        skeleton={nodes.EyeRight.skeleton}
        morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
        morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Head"
        geometry={nodes.Wolf3D_Head.geometry}
        material={materials.Wolf3D_Skin}
        skeleton={nodes.Wolf3D_Head.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
      />
      <skinnedMesh
        name="Wolf3D_Teeth"
        geometry={nodes.Wolf3D_Teeth.geometry}
        material={materials.Wolf3D_Teeth}
        skeleton={nodes.Wolf3D_Teeth.skeleton}
        morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
        morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
      />
    </group>
  );
}

useGLTF.preload("/models/646d9dcdc8a5f5bddbfac913.glb");
