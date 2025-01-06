import { motion } from "framer-motion";

export const ComingSoon = ({ feature }: { feature: string }) => {
  return (
    <div className="min-h-screen pt-16 flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-md p-6 rounded-lg shadow-lg max-w-md w-full text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center"
        >
          <h1 className="text-4xl font-bold text-nzgreen-600 mb-4">{feature}</h1>
          <div className="w-24 h-1 bg-nzgreen-500 rounded mb-8"></div>
          <p className="text-xl text-stone-600 max-w-md">
            Coming soon! Stay tuned for exciting updates.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
