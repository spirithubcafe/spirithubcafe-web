import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  getCountryByCode, 
  getStatesByCountryCode, 
  getCitiesByStateCode,
  isValidAramexDestination
} from '@/data/aramex-countries';

export interface ShippingLocation {
  country: string;
  countryName: string;
  state: string;
  stateName: string;
  city: string;
  isValid: boolean;
  currency: string;
}

export const useAramexLocation = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [selectedCountry, setSelectedCountry] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');

  // Reset state and city when country changes
  useEffect(() => {
    if (selectedCountry) {
      setSelectedState('');
      setSelectedCity('');
    }
  }, [selectedCountry]);

  // Reset city when state changes
  useEffect(() => {
    if (selectedState) {
      setSelectedCity('');
    }
  }, [selectedState]);

  const handleCountryChange = useCallback((countryCode: string) => {
    setSelectedCountry(countryCode);
  }, []);

  const handleStateChange = useCallback((stateCode: string) => {
    setSelectedState(stateCode);
  }, []);

  const handleCityChange = useCallback((cityName: string) => {
    setSelectedCity(cityName);
  }, []);

  // Get current location info
  const getCurrentLocation = useCallback((): ShippingLocation | null => {
    if (!selectedCountry || !selectedState || !selectedCity) {
      return null;
    }

    const country = getCountryByCode(selectedCountry);
    if (!country) return null;

    const states = getStatesByCountryCode(selectedCountry);
    const state = states.find(s => s.code === selectedState);
    if (!state) return null;

    const cities = getCitiesByStateCode(selectedCountry, selectedState);
    const city = cities.find(c => c.name === selectedCity);
    if (!city) return null;

    return {
      country: selectedCountry,
      countryName: isRTL ? country.nameAr : country.name,
      state: selectedState,
      stateName: isRTL ? state.nameAr : state.name,
      city: selectedCity,
      isValid: isValidAramexDestination(selectedCountry, selectedCity),
      currency: country.currency
    };
  }, [selectedCountry, selectedState, selectedCity, isRTL]);

  // Validate current selection
  const isLocationValid = useCallback((): boolean => {
    const location = getCurrentLocation();
    return location?.isValid || false;
  }, [getCurrentLocation]);

  // Get formatted address
  const getFormattedAddress = useCallback((): string => {
    const location = getCurrentLocation();
    if (!location) return '';

    return `${location.city}, ${location.stateName}, ${location.countryName}`;
  }, [getCurrentLocation]);

  // Reset all selections
  const resetLocation = useCallback(() => {
    setSelectedCountry('');
    setSelectedState('');
    setSelectedCity('');
  }, []);

  // Set location from external data
  const setLocation = useCallback((location: {
    country?: string;
    state?: string;
    city?: string;
  }) => {
    if (location.country) setSelectedCountry(location.country);
    if (location.state) setSelectedState(location.state);
    if (location.city) setSelectedCity(location.city);
  }, []);

  // Check if Aramex delivery is available
  const isAramexAvailable = useCallback((): boolean => {
    if (!selectedCountry || !selectedCity) return false;
    return isValidAramexDestination(selectedCountry, selectedCity);
  }, [selectedCountry, selectedCity]);

  // Get shipping rate info
  const getShippingRateInfo = useCallback(() => {
    const location = getCurrentLocation();
    if (!location || !location.isValid) {
      return {
        available: false,
        country: selectedCountry,
        city: selectedCity,
        error: 'Invalid destination for Aramex delivery'
      };
    }

    return {
      available: true,
      country: location.country,
      city: location.city,
      countryName: location.countryName,
      stateName: location.stateName,
      currency: location.currency,
      formattedAddress: getFormattedAddress()
    };
  }, [getCurrentLocation, selectedCountry, selectedCity, getFormattedAddress]);

  return {
    // State
    selectedCountry,
    selectedState,
    selectedCity,
    
    // Actions
    handleCountryChange,
    handleStateChange,
    handleCityChange,
    resetLocation,
    setLocation,
    
    // Computed values
    getCurrentLocation,
    isLocationValid,
    isAramexAvailable,
    getFormattedAddress,
    getShippingRateInfo,
    
    // Validation
    isValid: isLocationValid(),
    isComplete: !!(selectedCountry && selectedState && selectedCity),
  };
};