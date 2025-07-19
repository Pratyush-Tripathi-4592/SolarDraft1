import { Zap, LogOut, Home, Sun, Battery, User, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

type ProfilePageProps = {
  onLogout: () => void;
};

const ProfilePage = ({ onLogout }: ProfilePageProps) => {
  const navigate = useNavigate();

  // Sample solar connection data
  const solarConnection = {
    connectionNumber: 'SOLAR-2023-5678',
    electricityBoard: 'Maharashtra State Electricity Distribution Co. Ltd.',
    aadhaarNumber: 'XXXX XXXX 7890',
    installationDate: '15 March 2023',
    systemCapacity: '5 kW',
    status: 'Active',
    lastBillAmount: '₹2,345',
    netMeteringStatus: 'Approved',
    estimatedSavings: '₹15,600 annually'
  };

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="md:w-64 bg-white rounded-lg shadow p-6 h-fit sticky top-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="bg-blue-100 p-2 rounded-full">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <h1 className="text-xl font-semibold">User Profile</h1>
            </div>
            
            <nav className="space-y-2">
              <button 
                className="w-full flex items-center space-x-2 p-2 rounded-lg bg-blue-50 text-blue-600"
                onClick={() => navigate('/profile')}
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </button>
              <button 
                className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
                onClick={() => navigate('/')}
              >
                <Home className="h-5 w-5" />
                <span>Home</span>
              </button>
              <button 
                className="w-full flex items-center space-x-2 p-2 rounded-lg text-red-600 hover:bg-red-50"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Profile Card */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold">John Doe</h2>
                  <p className="text-gray-600">SolarConnect Member since 2023</p>
                </div>
                <div className="bg-blue-100 px-3 py-1 rounded-full text-sm font-medium text-blue-800">
                  Premium Member
                </div>
              </div>
            </div>

            {/* Solar Connection Card */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-green-100 p-2 rounded-full">
                  <Sun className="h-6 w-6 text-green-600" />
                </div>
                <h2 className="text-xl font-semibold">Solar Connection Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Connection Number</h3>
                  <p className="font-semibold">{solarConnection.connectionNumber}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Electricity Board</h3>
                  <p className="font-semibold">{solarConnection.electricityBoard}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Aadhaar Number</h3>
                  <p className="font-semibold">{solarConnection.aadhaarNumber}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Installation Date</h3>
                  <p className="font-semibold">{solarConnection.installationDate}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">System Capacity</h3>
                  <p className="font-semibold">{solarConnection.systemCapacity}</p>
                </div>
                <div>
                  <h3 className="font-medium text-gray-500 mb-1">Status</h3>
                  <div className="flex items-center">
                    <div className={`h-2 w-2 rounded-full mr-2 ${solarConnection.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <p className="font-semibold">{solarConnection.status}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Solar Performance Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <Battery className="h-6 w-6 text-yellow-600" />
                </div>
                <h2 className="text-xl font-semibold">System Performance</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-blue-50 p-4 rounded-lg text-center">
                  <h3 className="text-gray-600 mb-2">Current Output</h3>
                  <p className="text-3xl font-bold text-blue-600">3.2 kW</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg text-center">
                  <h3 className="text-gray-600 mb-2">Today's Generation</h3>
                  <p className="text-3xl font-bold text-green-600">18.5 kWh</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg text-center">
                  <h3 className="text-gray-600 mb-2">Monthly Savings</h3>
                  <p className="text-3xl font-bold text-purple-600">₹1,250</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
