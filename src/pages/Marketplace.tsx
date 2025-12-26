import { ComingSoon } from "@/components/ComingSoon";
import { Navbar } from "@/components/Navbar";

const Marketplace = () => {
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
        <ComingSoon feature="Marketplace" />
      </div>
    </div>
  );
};

export default Marketplace;