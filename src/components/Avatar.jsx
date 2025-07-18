import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useFBX, useAnimations, Bounds } from "@react-three/drei";
import * as THREE from "three";

function AvatarModel({
  audioUrl,
  animationCue,
  headFollow = true,
  smoothMorphTarget = true,
  morphTargetSmoothing = 0.5,
  showFaceMarker = false,
  ...props
}) {
  const { nodes, materials } = useGLTF("/models/646d9dcdc8a5f5bddbfac913.glb");
  const { animations: idleAnims } = useFBX("/animations/Idle.fbx");
  const { animations: angryAnims } = useFBX("/animations/Angry Gesture.fbx");
  const { animations: greetAnims } = useFBX("/animations/Standing Greeting.fbx");

  if (idleAnims[0]) idleAnims[0].name = "Idle";
  if (angryAnims[0]) angryAnims[0].name = "Angry";
  if (greetAnims[0]) greetAnims[0].name = "Greeting";

  const [animation, setAnimation] = useState("Idle");
  const group = useRef();
  const { actions } = useAnimations(
    [idleAnims[0], angryAnims[0], greetAnims[0]].filter(Boolean),
    group
  );

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

  useEffect(() => {
    if (animationCue && actions && actions[animationCue]) {
      setAnimation(animationCue);
    }
  }, [animationCue, actions]);

  const audioRef = useRef();
  const rafRef = useRef();
  const audioCtxRef = useRef();
  const analyserRef = useRef();
  const mouthViseme = "viseme_aa";

  useEffect(() => {
    if (!audioUrl || !nodes.Wolf3D_Head || !nodes.Wolf3D_Teeth) return;
    if (audioRef.current) audioRef.current.pause();

    const audio = new Audio(audioUrl);
    audioRef.current = audio;

    let mouthIdxHead = nodes.Wolf3D_Head.morphTargetDictionary[mouthViseme] ?? 0;
    let mouthIdxTeeth = nodes.Wolf3D_Teeth.morphTargetDictionary[mouthViseme] ?? 0;

    let ctx = null;
    let src = null;
    let analyser = null;
    let data = null;
    let isMounted = true;

    function animate() {
      if (!isMounted) return;
      analyser.getByteFrequencyData(data);
      const avg = data.reduce((a, b) => a + b, 0) / data.length;
      const mouth = Math.min(avg / 90, 1);

      const lerp = THREE.MathUtils.lerp;
      nodes.Wolf3D_Head.morphTargetInfluences[mouthIdxHead] = smoothMorphTarget
        ? lerp(nodes.Wolf3D_Head.morphTargetInfluences[mouthIdxHead], mouth, morphTargetSmoothing)
        : mouth;
      nodes.Wolf3D_Teeth.morphTargetInfluences[mouthIdxTeeth] = smoothMorphTarget
        ? lerp(nodes.Wolf3D_Teeth.morphTargetInfluences[mouthIdxTeeth], mouth, morphTargetSmoothing)
        : mouth;

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
      ctx?.close();
      nodes.Wolf3D_Head.morphTargetInfluences[mouthIdxHead] = 0;
      nodes.Wolf3D_Teeth.morphTargetInfluences[mouthIdxTeeth] = 0;
      setAnimation("Idle");
    };

    audio.play();

    return () => {
      isMounted = false;
      audio.pause();
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      audioCtxRef.current?.close();
      nodes.Wolf3D_Head.morphTargetInfluences[mouthIdxHead] = 0;
      nodes.Wolf3D_Teeth.morphTargetInfluences[mouthIdxTeeth] = 0;
    };
  }, [audioUrl, nodes, smoothMorphTarget, morphTargetSmoothing]);

  useFrame((state) => {
    if (headFollow && group.current) {
      const candidateNames = ["Head", "Wolf3D_Head", "Wolf3D_Head_2"];
      let head = null;
      for (let name of candidateNames) {
        head = group.current.getObjectByName(name);
        if (head) break;
      }
      head?.lookAt(state.camera.position);
    }
  });

  return (
    <group ref={group} {...props} dispose={null}>
      <primitive object={nodes.Hips} />
      <skinnedMesh geometry={nodes.Wolf3D_Body.geometry} material={materials.Wolf3D_Body} skeleton={nodes.Wolf3D_Body.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Outfit_Bottom.geometry} material={materials.Wolf3D_Outfit_Bottom} skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Outfit_Footwear.geometry} material={materials.Wolf3D_Outfit_Footwear} skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Outfit_Top.geometry} material={materials.Wolf3D_Outfit_Top} skeleton={nodes.Wolf3D_Outfit_Top.skeleton} />
      <skinnedMesh geometry={nodes.Wolf3D_Hair.geometry} material={materials.Wolf3D_Hair} skeleton={nodes.Wolf3D_Hair.skeleton} />
      <skinnedMesh name="EyeLeft" geometry={nodes.EyeLeft.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeLeft.skeleton} morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary} morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences} />
      <skinnedMesh name="EyeRight" geometry={nodes.EyeRight.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeRight.skeleton} morphTargetDictionary={nodes.EyeRight.morphTargetDictionary} morphTargetInfluences={nodes.EyeRight.morphTargetInfluences} />
      <skinnedMesh name="Wolf3D_Head" geometry={nodes.Wolf3D_Head.geometry} material={materials.Wolf3D_Skin} skeleton={nodes.Wolf3D_Head.skeleton} morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary} morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences} />
      <skinnedMesh name="Wolf3D_Teeth" geometry={nodes.Wolf3D_Teeth.geometry} material={materials.Wolf3D_Teeth} skeleton={nodes.Wolf3D_Teeth.skeleton} morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary} morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences} />
      {showFaceMarker && (
        <mesh position={[0, 1.6, 0]}>
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial color="red" />
        </mesh>
      )}
    </group>
  );
}

useGLTF.preload("/models/646d9dcdc8a5f5bddbfac913.glb");

// Wrap avatar in <Bounds> for auto-framing
export default AvatarModel;
