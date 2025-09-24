import { ResearchDashboard } from '@/components/lab/ResearchDashboard';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  return (
    <ResearchDashboard
      onStartResearch={() => navigate('/research')}
      onSetupCompanyProfile={() => navigate('/company-profile')}
      onSetupUserProfile={() => navigate('/user-profile')}
    />
  );
};

export default Index;
