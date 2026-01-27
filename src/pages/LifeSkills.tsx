import LifeSkillsRadarChart from "@/components/system/LifeSkillsRadarChart";

const LifeSkillsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Life OS Dashboard</h1>
          <p className="text-gray-600">Track your personal development across multiple dimensions</p>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <LifeSkillsRadarChart />
        </div>
      </div>
    </div>
  );
};

export default LifeSkillsPage;
