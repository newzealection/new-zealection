import { motion } from "framer-motion";

const ComingSoon = ({ feature }: { feature: string }) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/10 backdrop-blur-[16px] p-8 rounded-lg max-w-md w-full text-center"
      >
        <h1 className="text-5xl font-bold text-green-500 mb-4">{feature}</h1>
        <div className="w-32 h-1 bg-green-500 rounded mb-8"></div>
        <p className="text-2xl text-gray-200">
          Coming soon! Stay tuned for exciting updates.
        </p>
      </motion.div>
    </div>
  );
};

export default ComingSoon;
