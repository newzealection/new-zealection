import { ComingSoon } from "@/components/ComingSoon";
import { Navbar } from "@/components/Navbar";

const Battlefield = () => {
  return (
    <div className="min-h-screen relative">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/battlefield-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <ComingSoon feature="Battlefield" />
      </div>
    </div>
  );
};

export default Battlefield;