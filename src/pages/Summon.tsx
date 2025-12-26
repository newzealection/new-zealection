import { ComingSoon } from "@/components/ComingSoon";
import { Navbar } from "@/components/Navbar";

const Summon = () => {
  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, #f5f5f4, #e7e5e4)',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <ComingSoon feature="Summon" />
      </div>
    </div>
  );
};

export default Summon;
