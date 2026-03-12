import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  FileText, 
  Loader2, 
  Sparkles, 
  Download, 
  Layout, 
  Wand2, 
  CheckCircle2,
  Zap,
  Star,
  TrendingUp,
  Mail
} from 'lucide-react';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [sentToEmail, setSentToEmail] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) setError(error.message);
      } else {
        const { error } = await signUp(email, password, name);
        if (error) {
          setError(error.message);
        } else {
          setSentToEmail(email);
          setEmailSent(true);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: Layout,
      title: 'Professional Templates',
      description: 'Choose from 6+ stunning, ATS-friendly resume templates',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Content',
      description: 'Generate professional content with Gemini AI assistance',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: Wand2,
      title: 'Advanced Formatting',
      description: 'Customize fonts, colors, and styles like Canva',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Download,
      title: 'Easy Export',
      description: 'Download your resume as PDF with one click',
      gradient: 'from-green-500 to-emerald-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      <div className="flex w-full max-w-7xl mx-auto relative z-10">
        {/* Left Section - Auth Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16">
          <div className="w-full max-w-md animate-fade-in-up">
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8 lg:p-10 border border-white/20">
              {/* Logo */}
              <div className="flex items-center justify-center mb-8">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg animate-float">
                  <FileText className="w-10 h-10 text-white" />
                </div>
              </div>

              <h1 className="text-4xl font-bold text-center text-white mb-2 animate-fade-in">
                Resume Builder
              </h1>
              <p className="text-center text-gray-300 mb-8 animate-fade-in animation-delay-200">
                {isLogin ? 'Welcome back! Sign in to continue' : 'Create your free account'}
              </p>

              {emailSent ? (
                <div className="text-center animate-fade-in">
                  <div className="flex items-center justify-center mb-6">
                    <div className="bg-green-500/20 border border-green-400/40 p-5 rounded-full">
                      <Mail className="w-12 h-12 text-green-400" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-3">Check your Gmail! 📬</h2>
                  <p className="text-gray-300 mb-2 text-sm leading-relaxed">
                    A confirmation email has been sent to
                  </p>
                  <p className="text-blue-300 font-semibold mb-4 break-all">{sentToEmail}</p>
                  <p className="text-gray-400 text-sm leading-relaxed mb-6">
                    Click the link in the email to confirm your account, then come back here to sign in.
                  </p>
                  <button
                    onClick={() => {
                      setEmailSent(false);
                      setIsLogin(true);
                      setPassword('');
                      setName('');
                    }}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                  >
                    Go to Sign In
                  </button>
                </div>
              ) : (
                <>
                <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <div className="animate-fade-in animation-delay-200">
                    <label htmlFor="name" className="block text-sm font-medium text-gray-200 mb-2">
                      Full Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                      placeholder="John Doe"
                    />
                  </div>
                )}

                <div className="animate-fade-in animation-delay-400">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    placeholder="you@example.com"
                  />
                </div>

                <div className="animate-fade-in animation-delay-600">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-200 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                    placeholder="••••••••"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm animate-shake">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 focus:ring-4 focus:ring-purple-500/50 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg animate-fade-in animation-delay-800"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <Zap className="w-5 h-5 ml-2" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center animate-fade-in animation-delay-1000">
                <button
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setError('');
                    setName('');
                  }}
                  className="text-blue-300 hover:text-blue-200 font-medium text-sm transition"
                >
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <span className="text-white font-semibold">
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </span>
                </button>
              </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right Section - Features Showcase */}
        <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-16 relative">
          <div className="w-full max-w-xl">
            {/* Main Heading */}
            <div className="mb-12 animate-fade-in-right">
              <div className="flex items-center gap-2 mb-4">
                <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
                <span className="text-yellow-400 font-semibold text-sm uppercase tracking-wider">
                  Professional Resume Builder
                </span>
              </div>
              <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                Build Your
                <span className="block bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 text-transparent bg-clip-text animate-gradient">
                  Dream Resume
                </span>
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                Create stunning, professional resumes with our AI-powered builder. 
                Stand out from the crowd and land your dream job faster.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer animate-fade-in-right"
                  style={{ animationDelay: `${(index + 2) * 200}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`bg-gradient-to-r ${feature.gradient} p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1 group-hover:text-blue-300 transition">
                        {feature.title}
                      </h3>
                      <p className="text-gray-400 text-sm leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                    <CheckCircle2 className="w-5 h-5 text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-6 animate-fade-in-right animation-delay-1400">
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1 flex items-center justify-center gap-1">
                  10K<TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <div className="text-gray-400 text-sm">Resumes Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1 flex items-center justify-center gap-1">
                  6<Star className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="text-gray-400 text-sm">Templates</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1 flex items-center justify-center gap-1">
                  AI<Sparkles className="w-5 h-5 text-purple-400" />
                </div>
                <div className="text-gray-400 text-sm">Powered</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes gradient {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .animate-fade-in-right {
          animation: fade-in-right 0.8s ease-out forwards;
          opacity: 0;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }

        .animation-delay-200 {
          animation-delay: 200ms;
        }

        .animation-delay-400 {
          animation-delay: 400ms;
        }

        .animation-delay-600 {
          animation-delay: 600ms;
        }

        .animation-delay-800 {
          animation-delay: 800ms;
        }

        .animation-delay-1000 {
          animation-delay: 1000ms;
        }

        .animation-delay-1200 {
          animation-delay: 1200ms;
        }

        .animation-delay-1400 {
          animation-delay: 1400ms;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}
