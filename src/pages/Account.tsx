import { Navbar } from "../components/Navbar";

const Account = () => {
  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar />
      <div className="container mx-auto px-4 pt-24">
        <h1 className="text-4xl font-bold text-gray-900">Account</h1>
      </div>
    </div>
  );
};

export default Account;