import React, { useState } from 'react';
import styles from '../Blogs.module.css';

const Blog = () => {
  const [darkMode, setDarkMode] = useState(true);

  const blogPosts = [
    {
      id: 1,
      title: "Understanding Anxiety Disorders in the Digital Age",
      excerpt: "Mental health professionals explore how technology impacts anxiety and provide evidence-based strategies for managing digital overwhelm.",
      author: "Dr. Sarah Chen",
      readTime: "8 min read",
      date: "Jul 15, 2025",
      category: "Mental Health",
      image: "/api/placeholder/400/250"
    },
    {
      id: 2,
      title: "The Science of Depression: Latest Research Findings",
      excerpt: "Recent studies reveal new insights into depression's neurological mechanisms and breakthrough treatment approaches.",
      author: "Dr. Michael Rodriguez",
      readTime: "12 min read",
      date: "Jul 12, 2025",
      category: "Research",
      image: "/api/placeholder/400/250"
    },
    {
      id: 3,
      title: "Mindfulness-Based Interventions for Trauma Recovery",
      excerpt: "Exploring how mindfulness practices can support healing from traumatic experiences and build resilience.",
      author: "Dr. Emma Thompson",
      readTime: "6 min read",
      date: "Jul 10, 2025",
      category: "Therapy",
      image: "/api/placeholder/400/250"
    },
    {
      id: 4,
      title: "AI in Mental Healthcare: Current Trends and Future Directions",
      excerpt: "Examining how artificial intelligence is transforming mental health diagnosis, treatment, and patient care.",
      author: "Dr. James Wilson",
      readTime: "15 min read",
      date: "Jul 8, 2025",
      category: "Technology",
      image: "/api/placeholder/400/250"
    },
    {
      id: 5,
      title: "Sleep Hygiene and Mental Wellness Connection",
      excerpt: "Understanding the crucial relationship between quality sleep and mental health outcomes in adolescents.",
      author: "Dr. Lisa Park",
      readTime: "7 min read",
      date: "Jul 5, 2025",
      category: "Wellness",
      image: "/api/placeholder/400/250"
    },
    {
      id: 6,
      title: "Building Resilience in Healthcare Workers",
      excerpt: "Strategies for supporting mental health professionals and preventing burnout in high-stress environments.",
      author: "Dr. Robert Kim",
      readTime: "10 min read",
      date: "Jul 3, 2025",
      category: "Professional",
      image: "/api/placeholder/400/250"
    }
  ];

  const researchPapers = [
    {
      id: 1,
      title: "Predictive Models for Suicide Prevention Using Electronic Health Records",
      excerpt: "A comprehensive study examining AI-based prediction models for identifying high-risk patients in healthcare systems.",
      authors: "Smith, J., et al.",
      journal: "Journal of Medical Internet Research",
      date: "2025",
      category: "Research Paper",
      doi: "10.2196/45123"
    },
    {
      id: 2,
      title: "Digital Mental Health Interventions: A Meta-Analysis",
      excerpt: "Systematic review of effectiveness of digital therapeutic interventions for depression and anxiety disorders.",
      authors: "Johnson, A., Brown, M., Davis, K.",
      journal: "Nature Mental Health",
      date: "2025",
      category: "Research Paper",
      doi: "10.1038/s44220-025-00234-1"
    },
    {
      id: 3,
      title: "Brain Connectivity and Cognitive Function in Early Psychosis",
      excerpt: "NIMH-funded study identifying links between brain connectivity patterns and cognitive outcomes in psychosis.",
      authors: "Williams, S., et al.",
      journal: "American Journal of Psychiatry",
      date: "2025",
      category: "Research Paper",
      doi: "10.1176/appi.ajp.2025.24050567"
    }
  ];

  const categories = ["All", "Mental Health", "Research", "Therapy", "Technology", "Wellness", "Professional"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPosts = selectedCategory === "All"
    ? blogPosts
    : blogPosts.filter(post => post.category === selectedCategory);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`${styles.blogContainer} ${darkMode ? styles.dark : styles.light}`}>
      {/* Header */}
      <header className={styles.blogHeader}>
        <div className={styles.headerContent}>
          <div className={styles.logo}>
            <h1>MindSpace</h1>
            <span className={styles.tagline}>Mental Health & Research Hub</span>
          </div>
          <nav className={styles.navMenu}>
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#research">Research</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className={styles.headerActions}>
            <button className={styles.themeToggle} onClick={toggleDarkMode}>
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button className={styles.writeBtn}>Write</button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <h2>Advancing Mental Health Through Research & Innovation</h2>
          <p>Discover evidence-based insights, research findings, and practical guidance for mental health professionals and advocates.</p>
          <div className={styles.heroStats}>
            <div className={styles.stat}>
              <span className={styles.statNumber}>500+</span>
              <span className={styles.statLabel}>Research Papers</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>50K+</span>
              <span className={styles.statLabel}>Monthly Readers</span>
            </div>
            <div className={styles.stat}>
              <span className={styles.statNumber}>100+</span>
              <span className={styles.statLabel}>Expert Contributors</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className={styles.categoryFilter}>
        <div className={styles.filterContainer}>
          {categories.map(category => (
            <button
              key={category}
              className={`${styles.filterBtn} ${selectedCategory === category ? styles.active : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.contentGrid}>
          {/* Blog Posts Section */}
          <section className={styles.blogPosts}>
            <h3 className={styles.sectionTitle}>Latest Articles</h3>
            <div className={styles.postsGrid}>
              {filteredPosts.map(post => (
                <article key={post.id} className={styles.postCard}>
                  <div className={styles.postImage}>
                    <img src={post.image} alt={post.title} />
                    <span className={styles.postCategory}>{post.category}</span>
                  </div>
                  <div className={styles.postContent}>
                    <h4 className={styles.postTitle}>{post.title}</h4>
                    <p className={styles.postExcerpt}>{post.excerpt}</p>
                    <div className={styles.postMeta}>
                      <div className={styles.authorInfo}>
                        <span className={styles.authorName}>{post.author}</span>
                        <span className={styles.postDate}>{post.date}</span>
                      </div>
                      <span className={styles.readTime}>{post.readTime}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>

          {/* Research Papers Section */}
          <section className={styles.researchPapers}>
            <h3 className={styles.sectionTitle}>Recent Research Papers</h3>
            <div className={styles.papersList}>
              {researchPapers.map(paper => (
                <article key={paper.id} className={styles.paperCard}>
                  <div className={styles.paperContent}>
                    <h4 className={styles.paperTitle}>{paper.title}</h4>
                    <p className={styles.paperExcerpt}>{paper.excerpt}</p>
                    <div className={styles.paperMeta}>
                      <div className={styles.paperAuthors}>
                        <strong>Authors:</strong> {paper.authors}
                      </div>
                      <div className={styles.paperJournal}>
                        <strong>Journal:</strong> {paper.journal} ({paper.date})
                      </div>
                      <div className={styles.paperDoi}>
                        <strong>DOI:</strong> {paper.doi}
                      </div>
                    </div>
                    <button className={styles.readPaperBtn}>Read Paper</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarWidget}>
            <h4>Featured Topics</h4>
            <ul className={styles.topicList}>
              <li><a href="#anxiety">Anxiety Disorders</a></li>
              <li><a href="#depression">Depression Research</a></li>
              <li><a href="#ai-mental-health">AI in Mental Health</a></li>
              <li><a href="#trauma-therapy">Trauma-Informed Care</a></li>
              <li><a href="#youth-mental-health">Youth Mental Health</a></li>
            </ul>
          </div>

          <div className={styles.sidebarWidget}>
            <h4>Mental Health Resources</h4>
            <div className={styles.resourceLinks}>
              <a href="#crisis-support" className={styles.resourceLink}>Crisis Support</a>
              <a href="#therapy-finder" className={styles.resourceLink}>Find a Therapist</a>
              <a href="#self-help" className={styles.resourceLink}>Self-Help Tools</a>
              <a href="#support-groups" className={styles.resourceLink}>Support Groups</a>
            </div>
          </div>

          <div className={styles.sidebarWidget}>
            <h4>Newsletter</h4>
            <p>Stay updated with the latest mental health research and insights.</p>
            <form className={styles.newsletterForm}>
              <input type="email" placeholder="Enter your email" />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </aside>
      </main>

      {/* Footer */}
      <footer className={styles.blogFooter}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <h4>MindSpace</h4>
            <p>Advancing mental health through evidence-based research and innovative approaches.</p>
          </div>
          <div className={styles.footerSection}>
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#about">About Us</a></li>
              <li><a href="#research">Research</a></li>
              <li><a href="#resources">Resources</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className={styles.footerSection}>
            <h4>Support</h4>
            <ul>
              <li><a href="#help">Help Center</a></li>
              <li><a href="#privacy">Privacy Policy</a></li>
              <li><a href="#terms">Terms of Service</a></li>
              <li><a href="#accessibility">Accessibility</a></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>&copy; 2025 MindSpace. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Blog;
