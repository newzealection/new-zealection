import { ComingSoon } from "@/components/ComingSoon";
import { Navbar } from "@/components/Navbar";

const Marketplace = () => {
  return (
    <div className="min-h-screen relative">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(https://i.imghippo.com/files/puJ1712SQ.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
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