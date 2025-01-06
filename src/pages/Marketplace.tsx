import { ComingSoon } from "@/components/ComingSoon";
import { Navbar } from "@/components/Navbar";

const Summon = () => {
  return (
    <div className="min-h-screen relative">
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(https://i.imghippo.com/files/nnGQ9211Fo.webp)',
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
