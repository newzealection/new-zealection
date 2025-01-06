import { ComingSoon } from "@/components/ComingSoon";
import { Navbar } from "@/components/Navbar";

const Summon = () => {
  return (
    <div className="min-h-screen relative">
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://i.imghippo.com/files/hRhQ4091yk.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      
      {/* Blur overlay */}
      <div className="absolute inset-0 backdrop-blur-[2px] bg-black/30 z-[1]" />
      
      {/* Content */}
      <div className="relative z-10">
        <Navbar />
        <ComingSoon feature="Summon" />
      </div>
    </div>
  );
};

export default Summon;
