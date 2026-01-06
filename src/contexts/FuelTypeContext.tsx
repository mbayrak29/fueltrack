import { createContext, useContext, useState, ReactNode } from 'react';

type FuelType = 'gasoline' | 'diesel' | 'lpg';

interface FuelTypeContextType {
  selectedFuelType: FuelType;
  setSelectedFuelType: (type: FuelType) => void;
}

const FuelTypeContext = createContext<FuelTypeContextType | undefined>(undefined);

export function FuelTypeProvider({ children }: { children: ReactNode }) {
  const [selectedFuelType, setSelectedFuelType] = useState<FuelType>('gasoline');

  return (
    <FuelTypeContext.Provider value={{ selectedFuelType, setSelectedFuelType }}>
      {children}
    </FuelTypeContext.Provider>
  );
}

export function useFuelType() {
  const context = useContext(FuelTypeContext);
  if (context === undefined) {
    throw new Error('useFuelType must be used within a FuelTypeProvider');
  }
  return context;
}
