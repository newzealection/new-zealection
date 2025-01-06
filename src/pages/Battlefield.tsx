import { ComingSoon } from "@/components/ComingSoon";
import { Navbar } from "@/components/Navbar";

const Summon = () => {
  return (
    <div className="min-h-screen relative">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(https://i.imghippo.com/files/jZRd3374cc.png)',
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
