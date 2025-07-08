/**
 * LANDING PAGE - Modern, impactful homepage showcasing real chat app features
 * 
 * This component provides:
 * - Hero section with dynamic animations and gradients
 * - Interactive feature showcase with 3D hover effects
 * - Live demo section with real account credentials
 * - Responsive design optimized f                  <div className="p-3 border rounded-lg bg-base-100 border-base-300">
                    <div className="font-medium text-secondary">👤 Jane Smith</div>
                    <div className="mt-1 text-xs text-base-content/70">
                      📧 jane@gmail.com<br />
                      🔑 123456
                    </div>
                  </div>devices
 * - Theme-aware styling with smooth transitions
 * 
 * Key Features:
 * - Mobile-first responsive design
 * - Interactive animations and particle effects
 * - Feature highlights with real functionality
 * - Call-to-action buttons with hover states
 * - Theme integration with smooth transitions
 */

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  MessageSquare, 
  Users, 
  Zap, 
  Shield, 
  Smartphone, 
  Brain,
  Eye,
  Bell,
  Search,
  Heart,
  Star,
  ArrowRight,
  Play,
  CheckCircle,
  Sparkles,
  Globe,
  Lock,
  Camera,
  Mic,
  FileText,
  Lightbulb,
  Rocket,
  Code,
  GitBranch,
  Database,
  Wifi,
  Image,
  MessageCircle,
  Layers,
  Trophy,
  Zap as Lightning,
  Cpu,
  Bot
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const LandingPage = () => {
  const { authUser } = useAuthStore();
  const [currentFeature, setCurrentFeature] = useState(0);
  const [isVisible, setIsVisible] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Enhanced featured items with real functionality
  const featuredItems = [
    {
      icon: Bot,
      title: "AI-Powered Chat Summaries",
      description: "Mark messages with !Chatty and get intelligent summaries using Google Gemini AI",
      color: "text-purple-500",
      gradient: "from-purple-500 to-pink-500"
    },
    {
      icon: Lightning,
      title: "Real-Time WebSocket",
      description: "Instant message delivery with Socket.io for seamless communication",
      color: "text-yellow-500",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Users,
      title: "Advanced Group Management",
      description: "Create groups, manage members, and control permissions with admin features",
      color: "text-blue-500",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: Image,
      title: "Cloudinary Image Sharing",
      description: "Upload and share images with optimized delivery and mobile-friendly sizing",
      color: "text-green-500",
      gradient: "from-green-500 to-emerald-500"
    }
  ];

  // Enhanced real features with detailed benefits
  const features = [
    {
      icon: Bot,
      title: "AI Chat Intelligence",
      description: "Leverage Google Gemini AI to generate intelligent summaries of your conversations. Simply mark important messages with !Chatty and get comprehensive summaries.",
      benefits: ["Google Gemini AI integration", "!Chatty message marking", "Previous day summaries", "Smart conversation filtering"],
      tech: ["Google Gemini API", "Natural Language Processing", "Message Classification"]
    },
    {
      icon: MessageCircle,
      title: "Real-Time Messaging",
      description: "Experience instant message delivery with WebSocket technology. Messages appear immediately across all connected devices.",
      benefits: ["Socket.io integration", "Real-time updates", "Connection persistence", "Offline message queuing"],
      tech: ["Socket.io", "WebSocket", "Real-time synchronization"]
    },
    {
      icon: Users,
      title: "Group Management",
      description: "Create and manage groups with comprehensive admin controls. Add members, set permissions, and organize team communication.",
      benefits: ["Group creation & management", "Member addition/removal", "Admin permissions", "Real-time member updates"],
      tech: ["MongoDB aggregation", "Real-time updates", "Permission system"]
    },
    {
      icon: Eye,
      title: "Read Receipt System",
      description: "Advanced read receipt tracking shows exactly who has read your messages and when, with detailed timestamp information.",
      benefits: ["Individual read tracking", "Group read status", "Timestamp precision", "Real-time status updates"],
      tech: ["MongoDB schemas", "Real-time tracking", "Status synchronization"]
    },
    {
      icon: Image,
      title: "Cloudinary Integration",
      description: "Professional image hosting and delivery with Cloudinary. Upload, optimize, and share images seamlessly across devices.",
      benefits: ["Automatic image optimization", "Mobile-friendly sizing", "Fast CDN delivery", "Secure image storage"],
      tech: ["Cloudinary API", "Image optimization", "CDN delivery"]
    },
    {
      icon: Smartphone,
      title: "Mobile-First Design",
      description: "Responsive design optimized for mobile devices with touch-friendly interfaces and adaptive layouts.",
      benefits: ["Touch-optimized UI", "Responsive layouts", "Mobile navigation", "Cross-device sync"],
      tech: ["Tailwind CSS", "Responsive design", "Mobile optimization"]
    }
  ];

  // Real statistics based on actual implementation
  const stats = [
    { number: "Real-time", label: "Message Delivery", icon: Lightning },
    { number: "AI", label: "Powered Summaries", icon: Brain },
    { number: "WebSocket", label: "Technology", icon: Wifi },
    { number: "Open", label: "Source", icon: Code }
  ];

  // Tech stack showcase
  const techStack = [
    { name: "React", category: "Frontend", color: "text-blue-400" },
    { name: "Node.js", category: "Backend", color: "text-green-400" },
    { name: "MongoDB", category: "Database", color: "text-green-500" },
    { name: "Socket.io", category: "Real-time", color: "text-purple-400" },
    { name: "Gemini AI", category: "AI", color: "text-yellow-400" },
    { name: "Cloudinary", category: "Images", color: "text-orange-400" }
  ];

  // Creator information and social links
  const creatorInfo = {
    name: "Yogiraj Shinde",
    role: "Final Year Engineering Student & Full-Stack Developer",
    description: "I’m Yogiraj Shinde, an engineering student and full stack developer. I built this chat app so you can tag important messages with !Chatty and instantly get concise summaries from Gemini AI to stay on top of every group conversation.",
    techStack: "Built with Node.js, MongoDB, React, Socket.io, Gemini AI, and Cloudinary",
    socialLinks: [
      {
        icon: GitBranch,
        label: "GitHub",
        url: "https://github.com/yogirajbshinde21/",
        color: "text-gray-600 hover:text-gray-800"
      },
      {
        icon: Globe,
        label: "LinkedIn",
        url: "https://www.linkedin.com/in/yogirajshinde/",
        color: "text-blue-600 hover:text-blue-800"
      }
    ],
    email: "jobsforyogiraj21@gmail.com"
  };

  // Mouse tracking for interactive effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Auto-rotate featured items
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % featuredItems.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [featuredItems.length]);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll('[data-animate]');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen overflow-hidden bg-base-100">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 pointer-events-none">
        <div 
          className="absolute transition-all duration-1000 rounded-full w-96 h-96 bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl"
          style={{
            left: `${mousePosition.x * 0.05}px`,
            top: `${mousePosition.y * 0.05}px`,
          }}
        />
        <div 
          className="absolute transition-all duration-1000 delay-100 rounded-full w-80 h-80 bg-gradient-to-r from-accent/20 to-primary/20 blur-3xl"
          style={{
            right: `${mousePosition.x * 0.03}px`,
            bottom: `${mousePosition.y * 0.03}px`,
          }}
        />
      </div>

      {/* Hero Section */}
      <section className="relative flex items-center justify-center min-h-screen md:min-h-screen bg-gradient-to-br from-primary/5 via-base-100 to-secondary/5">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container relative px-4 py-8 mx-auto sm:py-16 lg:py-24">
          <div className="text-center">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 mb-6 text-xs font-medium border rounded-full sm:px-6 sm:py-3 sm:text-sm bg-gradient-to-r from-primary/20 to-secondary/20 text-primary animate-pulse border-primary/30">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-semibold text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text">
                AI-Powered Real-time Chat
              </span>
            </div>

            {/* Main Heading with enhanced typography */}
            <h1 className="mb-4 text-3xl font-bold tracking-tight sm:mb-6 sm:text-5xl lg:text-6xl xl:text-7xl">
              <span className="text-transparent bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text animate-pulse">
                Chatwise
              </span>
              <br />
              <span className="text-lg font-medium text-base-content/90 sm:text-2xl lg:text-3xl xl:text-4xl">
                Where Teams Connect Smarter
              </span>
            </h1>

            <p className="max-w-3xl mx-auto mb-6 text-base leading-relaxed text-base-content/80 sm:mb-8 sm:text-lg lg:text-xl">
              Experience next-generation team communication with{" "}
              <span className="font-semibold text-primary">AI-powered summaries</span> using !Chatty,{" "}
              <span className="font-semibold text-secondary">real-time messaging</span>, and{" "}
              <span className="font-semibold text-accent">seamless collaboration</span>.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col gap-6 mb-12 sm:flex-row sm:justify-center">
              {authUser ? (
                <Link
                  to="/"
                  className="relative overflow-hidden transition-all duration-300 transform btn btn-primary btn-lg group hover-glow hover:scale-105"
                >
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-primary to-secondary group-hover:opacity-100"></div>
                  <MessageSquare className="relative z-10 w-6 h-6" />
                  <span className="relative z-10">Enter Chat Room</span>
                  <ArrowRight className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-2" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/signup"
                    className="relative overflow-hidden transition-all duration-300 transform btn btn-primary btn-lg group hover-glow hover:scale-105"
                  >
                    <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-primary to-secondary group-hover:opacity-100"></div>
                    <Rocket className="relative z-10 w-6 h-6" />
                    <span className="relative z-10">Start Free Today</span>
                    <ArrowRight className="relative z-10 w-5 h-5 transition-transform group-hover:translate-x-2" />
                  </Link>
                  <Link
                    to="/login"
                    className="transition-all duration-300 transform btn btn-outline btn-lg group hover:scale-105"
                  >
                    <Play className="w-5 h-5 transition-transform group-hover:scale-110" />
                    <span>Try Live Demo</span>
                  </Link>
                </>
              )}
            </div>

            {/* Enhanced Demo Credentials */}
            {!authUser && (
              <div className="max-w-lg p-6 mx-auto mt-8 border shadow-lg bg-gradient-to-r from-base-200 to-base-300 rounded-2xl border-base-300">
                <div className="flex items-center justify-center mb-3">
                  <Lightbulb className="w-5 h-5 mr-2 text-primary" />
                  <span className="text-base font-semibold text-base-content">
                    Ready-to-use Demo Accounts
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
                  <div className="p-3 border rounded-lg bg-base-100 border-base-300">
                    <div className="font-medium text-primary">👤 John Doe</div>
                    <div className="mt-1 text-xs text-base-content/70">
                      📧 john@gmail.com<br />
                      🔑 123456
                    </div>
                  </div>
                  <div className="p-3 border rounded-lg bg-base-100 border-base-300">
                    <div className="font-medium text-secondary">� Jane Smith</div>
                    <div className="mt-1 text-xs text-base-content/70">
                      �📧 jane@gmail.com<br />
                      🔑 123456
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Featured Rotating Cards */}
          <div className="mt-20 lg:mt-32">
            <div className="mb-12 text-center">
              <h3 className="mb-4 text-2xl font-bold text-base-content">
                Powered by Modern Technology
              </h3>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {featuredItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div
                    key={index}
                    className={`group relative p-8 bg-gradient-to-br from-base-200/80 to-base-300/50 backdrop-blur-sm rounded-3xl border border-base-300/50 transition-all duration-700 hover:scale-110 hover:shadow-2xl cursor-pointer ${
                      currentFeature === index ? 'ring-2 ring-primary/50 bg-gradient-to-br from-primary/10 to-secondary/10 shadow-2xl scale-105' : ''
                    }`}
                    style={{
                      animationDelay: `${index * 200}ms`,
                      transform: currentFeature === index ? 'scale(1.05) rotateY(5deg)' : 'scale(1) rotateY(0deg)'
                    }}
                  >
                    <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 rounded-3xl transition-opacity duration-500`}></div>
                    <div className="relative z-10">
                      <Icon className={`w-12 h-12 mb-6 ${item.color} transition-all duration-500 group-hover:scale-125`} />
                      <h3 className="mb-4 text-xl font-bold transition-colors duration-300 text-base-content group-hover:text-primary">
                        {item.title}
                      </h3>
                      <p className="leading-relaxed text-base-content/70">
                        {item.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="relative py-16 overflow-hidden bg-gradient-to-r from-base-200/50 to-base-300/30 sm:py-20">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container relative px-4 mx-auto">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl lg:text-4xl">
              Built with Modern Technology
            </h2>
            <p className="text-base text-base-content/70 sm:text-lg">
              Enterprise-grade features powered by cutting-edge tech stack
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 lg:grid-cols-4 sm:gap-8">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className="text-center transition-transform duration-300 group hover:scale-105 sm:hover:scale-110"
                >
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <Icon className="w-10 h-10 transition-colors duration-300 text-primary group-hover:text-secondary sm:w-12 sm:h-12" />
                  </div>
                  <div className="mb-2 text-2xl font-bold transition-colors duration-300 text-primary lg:text-3xl xl:text-4xl group-hover:text-secondary">
                    {stat.number}
                  </div>
                  <div className="text-sm font-medium text-base-content/70 sm:text-base">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-16 bg-gradient-to-br from-base-100 to-base-200/50 sm:py-20">
        <div className="container px-4 mx-auto">
          <div className="mb-12 text-center sm:mb-16">
            <h2 className="mb-4 text-2xl font-bold sm:text-3xl lg:text-4xl">
              <Code className="inline w-6 h-6 mr-2 text-primary sm:w-8 sm:h-8 sm:mr-3" />
              Modern Tech Stack
            </h2>
            <p className="max-w-2xl mx-auto text-base text-base-content/70 sm:text-lg">
              Built with industry-leading technologies for performance, scalability, and developer experience
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6 sm:gap-6">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className="p-4 text-center transition-all duration-300 border bg-base-100 rounded-2xl border-base-300 hover:border-primary/50 hover:shadow-lg hover:scale-105 group sm:p-6"
              >
                <div className={`text-lg font-bold ${tech.color} mb-2 group-hover:scale-110 transition-transform duration-300 sm:text-2xl`}>
                  {tech.name}
                </div>
                <div className="text-xs text-base-content/60 sm:text-sm">
                  {tech.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-20 lg:py-24 bg-gradient-to-br from-base-100 to-base-200/30">
        <div className="container px-4 mx-auto">
          <div className="mb-16 text-center sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-2 mb-4 text-sm font-medium rounded-full bg-primary/10 text-primary sm:px-4 sm:mb-6">
              <Trophy className="w-4 h-4" />
              Enterprise-Grade Features
            </div>
            <h2 className="mb-4 text-3xl font-bold sm:mb-6 sm:text-4xl lg:text-5xl">
              Everything You Need for Modern Communication
            </h2>
            <p className="max-w-3xl mx-auto text-base leading-relaxed text-base-content/70 sm:text-lg md:text-xl">
              Built with cutting-edge technology to deliver seamless team collaboration and AI-powered insights
            </p>
          </div>

          <div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 sm:gap-8 lg:gap-10"
            id="features"
            data-animate
          >
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`group relative p-6 bg-gradient-to-br from-base-100 to-base-200/50 border border-base-300/50 rounded-3xl hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 sm:p-8 sm:hover:shadow-2xl sm:hover:-translate-y-4 ${
                    isVisible.features ? 'animate-fade-in-up' : 'opacity-0'
                  }`}
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl group-hover:opacity-100"></div>
                  
                  <div className="relative z-10">
                    <div className="flex items-center mb-4 sm:mb-6">
                      <div className="p-3 transition-all duration-300 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl group-hover:from-primary/30 group-hover:to-secondary/30 sm:p-4">
                        <Icon className="w-6 h-6 transition-transform duration-300 text-primary group-hover:scale-110 sm:w-8 sm:h-8" />
                      </div>
                    </div>
                    
                    <h3 className="mb-3 text-xl font-bold transition-colors duration-300 text-base-content group-hover:text-primary sm:mb-4 sm:text-2xl">
                      {feature.title}
                    </h3>
                    
                    <p className="mb-4 text-sm leading-relaxed text-base-content/70 sm:mb-6 sm:text-base">
                      {feature.description}
                    </p>
                    
                    <div className="mb-4 space-y-2 sm:mb-6 sm:space-y-3">
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className="flex items-center text-xs text-base-content/80 sm:text-sm">
                          <CheckCircle className="flex-shrink-0 w-3 h-3 mr-2 text-green-500 sm:w-4 sm:h-4 sm:mr-3" />
                          <span>{benefit}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="pt-3 border-t border-base-300/50 sm:pt-4">
                      <div className="mb-2 text-xs text-base-content/60">Technologies:</div>
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        {feature.tech.map((tech, techIndex) => (
                          <span 
                            key={techIndex}
                            className="px-2 py-1 text-xs rounded-full bg-primary/10 text-primary"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Meet the Creator Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-base-200/30 to-base-300/20 sm:py-24">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container relative px-4 mx-auto">
          <div className="mb-16 text-center sm:mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-2 mb-4 text-sm font-medium rounded-full bg-secondary/10 text-secondary sm:px-4 sm:mb-6">
              <Code className="w-4 h-4" />
              Meet the Creator
            </div>
            <h2 className="mb-4 text-3xl font-bold sm:mb-6 sm:text-4xl lg:text-5xl">
              Built by a Passionate Developer
            </h2>
            <p className="max-w-2xl mx-auto text-base text-base-content/70 sm:text-lg md:text-xl">
              Learn about the person behind this innovative chat application
            </p>
          </div>

          <div 
            className="max-w-4xl mx-auto"
            id="creator"
            data-animate
          >
            <div className={`relative p-6 lg:p-8 xl:p-12 bg-gradient-to-br from-base-100 to-base-200/50 rounded-3xl border border-base-300/50 shadow-lg hover:shadow-xl transition-all duration-500 sm:hover:shadow-2xl ${
              isVisible.creator ? 'animate-fade-in-up' : 'opacity-0'
            }`}>
              
              {/* Creator Profile */}
              <div className="mb-6 text-center sm:mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 mb-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl sm:w-16 sm:h-16 sm:mb-6">
                  <Code className="w-6 h-6 text-primary sm:w-8 sm:h-8" />
                </div>
                <h3 className="mb-2 text-2xl font-bold text-base-content sm:text-3xl">{creatorInfo.name}</h3>
                <p className="mb-4 text-lg font-medium text-primary sm:mb-6 sm:text-xl">{creatorInfo.role}</p>
                <p className="max-w-3xl mx-auto mb-4 text-sm leading-relaxed text-base-content/80 sm:mb-6 sm:text-base md:text-lg">
                  {creatorInfo.description}
                </p>
                
                {/* Contact Info */}
                <div className="flex flex-col items-center justify-center gap-3 mb-4 sm:flex-row sm:gap-4 sm:mb-6">
                  <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
                    {creatorInfo.socialLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center gap-2 px-4 py-2 rounded-full border border-base-300 hover:border-primary/50 transition-all duration-300 ${link.color} hover:bg-primary/5 hover:scale-105 sm:px-6 sm:py-3`}
                      >
                        <link.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span className="text-sm font-medium sm:text-base">{link.label}</span>
                      </a>
                    ))}
                  </div>
                  <a
                    href={`mailto:${creatorInfo.email}`}
                    className="flex items-center gap-2 px-4 py-2 transition-all duration-300 border rounded-full border-base-300 hover:border-primary/50 text-primary hover:bg-primary/5 hover:scale-105 sm:px-6 sm:py-3"
                  >
                    <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm font-medium sm:text-base">Contact</span>
                  </a>
                </div>
              </div>
              
              {/* Tech Stack */}
              <div className="pt-6 border-t border-base-300/30 sm:pt-8">
                <h4 className="mb-3 text-base font-semibold text-center text-base-content sm:mb-4 sm:text-lg">
                  Built with Modern Technology
                </h4>
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  {techStack.map((tech, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 transition-all duration-300 border rounded-full border-base-300/50 bg-base-200/30 hover:bg-base-200/60 hover:scale-105 sm:px-4"
                    >
                      <span className={`text-sm font-medium ${tech.color} sm:text-base`}>{tech.name}</span>
                      <span className="ml-1 text-xs text-base-content/60 sm:ml-2">({tech.category})</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-center text-base-content/70 sm:mt-4 sm:text-sm">
                  {creatorInfo.techStack}
                </p>
              </div>
              
              {/* Call to Action */}
              <div className="mt-6 text-center sm:mt-8">
                <a
                  href="https://github.com/yogirajbshinde21/Chatwise"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white transition-all duration-300 rounded-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:scale-105 sm:px-6 sm:py-3 sm:text-base"
                >
                  <GitBranch className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>View Source Code</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="relative py-20 overflow-hidden lg:py-24 bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container relative px-4 mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-2 mb-6 text-sm font-medium rounded-full bg-primary/20 text-primary sm:px-4 sm:mb-8">
              <Rocket className="w-4 h-4" />
              Ready to Get Started?
            </div>
            
            <h2 className="mb-4 text-3xl font-bold sm:mb-6 sm:text-4xl lg:text-5xl">
              Transform Your Team Communication Today
            </h2>
            
            <p className="max-w-3xl mx-auto mb-8 text-base leading-relaxed text-base-content/70 sm:mb-12 sm:text-lg md:text-xl">
              Join developers and teams exploring this open-source chat application with AI integration, 
              real-time messaging, and modern collaboration features.
            </p>
            
            {!authUser && (
              <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:justify-center sm:gap-6 sm:mb-12">
                <Link
                  to="/signup"
                  className="relative overflow-hidden transition-all duration-300 transform btn btn-primary btn-lg group hover-glow hover:scale-105"
                >
                  <div className="absolute inset-0 transition-opacity duration-300 opacity-0 bg-gradient-to-r from-primary to-secondary group-hover:opacity-100"></div>
                  <Rocket className="relative z-10 w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="relative z-10">Start Free Account</span>
                  <ArrowRight className="relative z-10 w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover:translate-x-2" />
                </Link>
                <Link
                  to="/login"
                  className="transition-all duration-300 transform btn btn-outline btn-lg group hover:scale-105"
                >
                  <Play className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Try Demo Now</span>
                </Link>
              </div>
            )}
            
            <div className="grid max-w-3xl grid-cols-1 gap-6 mx-auto md:grid-cols-3 sm:gap-8">
              <div className="text-center">
                <div className="mb-2 text-xl font-bold text-primary sm:text-2xl">
                  <Globe className="w-6 h-6 mx-auto mb-2 sm:w-8 sm:h-8" />
                  Open Source
                </div>
                <p className="text-xs text-base-content/70 sm:text-sm">
                  Free to use, modify, and contribute
                </p>
              </div>
              <div className="text-center">
                <div className="mb-2 text-xl font-bold text-secondary sm:text-2xl">
                  <Database className="w-6 h-6 mx-auto mb-2 sm:w-8 sm:h-8" />
                  Self-Hosted
                </div>
                <p className="text-xs text-base-content/70 sm:text-sm">
                  Deploy on your own infrastructure
                </p>
              </div>
              <div className="text-center">
                <div className="mb-2 text-xl font-bold text-accent sm:text-2xl">
                  <Code className="w-6 h-6 mx-auto mb-2 sm:w-8 sm:h-8" />
                  Developer-Friendly
                </div>
                <p className="text-xs text-base-content/70 sm:text-sm">
                  Modern tech stack and clean code
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="py-12 bg-gradient-to-br from-base-300 to-base-200 sm:py-16">
        <div className="container px-4 mx-auto">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4 sm:gap-3 sm:mb-6">
              <div className="p-1 bg-primary/10 rounded-xl sm:p-2">
                <MessageSquare className="w-6 h-6 text-primary sm:w-8 sm:h-8" />
              </div>
              <span className="text-2xl font-bold text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text sm:text-3xl">
                Chatwise
              </span>
            </div>
            
            <p className="max-w-2xl mx-auto mb-6 text-sm text-base-content/70 sm:mb-8 sm:text-base md:text-lg">
              Next-generation team communication platform with AI-powered features, 
              real-time messaging, and modern collaboration tools.
            </p>
            
            <div className="flex flex-wrap justify-center gap-4 mb-6 text-xs text-base-content/60 sm:gap-8 sm:mb-8 sm:text-sm">
              <a href="#" className="flex items-center gap-1 transition-colors duration-300 hover:text-primary sm:gap-2">
                <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                Privacy Policy
              </a>
              <a href="#" className="flex items-center gap-1 transition-colors duration-300 hover:text-primary sm:gap-2">
                <FileText className="w-3 h-3 sm:w-4 sm:h-4" />
                Terms of Service
              </a>
              <a href="#" className="flex items-center gap-1 transition-colors duration-300 hover:text-primary sm:gap-2">
                <GitBranch className="w-3 h-3 sm:w-4 sm:h-4" />
                GitHub
              </a>
              <a href="#" className="flex items-center gap-1 transition-colors duration-300 hover:text-primary sm:gap-2">
                <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
                Support
              </a>
            </div>
            
            <div className="pt-6 text-center border-t border-base-300/50 text-base-content/60 sm:pt-8">
              <p className="text-xs sm:text-sm">© 2024 Chatwise. Built with ❤️ for modern teams.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
