import { ComingSoon } from "@/components/ComingSoon";
import { Navbar } from "@/components/Navbar";

const Summon = () => {
  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: 'url(/lovable-uploads/ceaa5dab-e9a9-42ca-ab33-116b20619c93.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-black/30" />
      
      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <ComingSoon feature="Summon" />
      </div>
    </div>
  );
};

export default Summon;