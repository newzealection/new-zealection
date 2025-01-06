import Image from 'next/image';
import { ComingSoon } from "@/components/ComingSoon";
import { Navbar } from "@/components/Navbar";

const Summon = () => {
  return (
    <div className="min-h-screen relative">
      <Image 
        src="https://i.imghippo.com/files/hRhQ4091yk.png" 
        alt="Background" 
        layout="fill" 
        objectFit="cover" 
        quality={100} 
        className="absolute z-0"
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
