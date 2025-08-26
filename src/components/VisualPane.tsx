import HangingIDCard from './HangingIDCard';

interface VisualPaneProps {
  activeSection?: string;
  onSectionClick?: (section: string) => void;
}

const VisualPane = ({ activeSection, onSectionClick }: VisualPaneProps) => {
  return (
    <HangingIDCard 
      activeSection={activeSection}
      onSectionClick={onSectionClick}
    />
  );
};

export default VisualPane;