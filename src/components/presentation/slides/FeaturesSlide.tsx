import { motion } from 'motion/react';
import { Layers, Keyboard, Cpu, Palette } from 'lucide-react';

const features = [
  {
    icon: Layers,
    title: 'Modular Architecture',
    description: 'Each slide is a distinct, swappable React component, making it simple to inject dynamic UI.',
  },
  {
    icon: Keyboard,
    title: 'Global Navigation',
    description: 'Fully keyboard-navigable just like a native presentation tool via a robust custom hook.',
  },
  {
    icon: Cpu,
    title: 'Hardware Accelerated',
    description: 'Buttery smooth Framer Motion transitions with optimized layout shifts and no jarring animations.',
  },
  {
    icon: Palette,
    title: 'Minimalist Aesthetic',
    description: 'Strict attention to tracking, leading, and high-contrast typography in a pure dark mode.',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function FeaturesSlide() {
  return (
    <div className="flex flex-col justify-center w-full h-full p-16 bg-[#0A0A0A]">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="mb-16 max-w-2xl"
      >
        <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-[#EDEDED] mb-4">
          Core Principles
        </h2>
        <div className="w-12 h-px bg-white/20 mb-6" />
        <p className="text-xl text-[#A1A1AA] font-light leading-relaxed">
          Designed with a ruthless commitment to minimalist, high-performance, and deeply interactive web application standards.
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl"
      >
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={index}
              variants={itemVariants}
              className="p-8 rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors duration-500 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 rounded-lg bg-white/[0.05] border border-white/10 text-white">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-medium text-[#EDEDED] tracking-wide">
                  {feature.title}
                </h3>
              </div>
              <p className="text-[#A1A1AA] leading-relaxed font-light">
                {feature.description}
              </p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
