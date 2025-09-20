import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useTranslation } from 'react-i18next';
import { 
  ARAMEX_GCC_COUNTRIES, 
  getStatesByCountryCode, 
  getCitiesByStateCode,
  type AramexCountry,
  type AramexState,
  type AramexCity 
} from '@/data/aramex-countries';

interface AramexLocationSelectorProps {
  selectedCountry?: string;
  selectedState?: string;
  selectedCity?: string;
  onCountryChange: (countryCode: string) => void;
  onStateChange: (stateCode: string) => void;
  onCityChange: (cityName: string) => void;
  disabled?: boolean;
  required?: boolean;
  showLabels?: boolean;
}

export const AramexLocationSelector: React.FC<AramexLocationSelectorProps> = ({
  selectedCountry,
  selectedState,
  selectedCity,
  onCountryChange,
  onStateChange,
  onCityChange,
  disabled = false,
  required = true,
  showLabels = true
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  const [availableStates, setAvailableStates] = useState<AramexState[]>([]);
  const [availableCities, setAvailableCities] = useState<AramexCity[]>([]);

  // Update states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const states = getStatesByCountryCode(selectedCountry);
      setAvailableStates(states);
      setAvailableCities([]);
      
      // Reset state and city selections
      onStateChange('');
      onCityChange('');
    } else {
      setAvailableStates([]);
      setAvailableCities([]);
    }
  }, [selectedCountry, onStateChange, onCityChange]);

  // Update cities when state changes
  useEffect(() => {
    if (selectedCountry && selectedState) {
      const cities = getCitiesByStateCode(selectedCountry, selectedState);
      setAvailableCities(cities);
      
      // Reset city selection
      onCityChange('');
    } else {
      setAvailableCities([]);
    }
  }, [selectedCountry, selectedState, onCityChange]);

  const handleCountryChange = (countryCode: string) => {
    onCountryChange(countryCode);
  };

  const handleStateChange = (stateCode: string) => {
    onStateChange(stateCode);
  };

  const handleCityChange = (cityName: string) => {
    onCityChange(cityName);
  };

  const getDisplayName = (name: string, nameAr: string) => {
    return isRTL ? nameAr : name;
  };

  return (
    <div className="space-y-4">
      {/* Country Selection */}
      <div>
        {showLabels && (
          <Label htmlFor="country" className="mb-2 block">
            {t('checkout.fields.country') || 'Country'} {required && '*'}
          </Label>
        )}
        <Select
          value={selectedCountry || ''}
          onValueChange={handleCountryChange}
          disabled={disabled}
          required={required}
        >
          <SelectTrigger id="country">
            <SelectValue 
              placeholder={t('checkout.placeholders.selectCountry') || 'Select country'} 
            />
          </SelectTrigger>
          <SelectContent>
            {ARAMEX_GCC_COUNTRIES.map((country: AramexCountry) => (
              <SelectItem key={country.code} value={country.code}>
                <div className="flex items-center gap-2">
                  <span>{country.flag}</span>
                  <span>{getDisplayName(country.name, country.nameAr)}</span>
                  <span className="text-sm text-gray-500">({country.code})</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* State/Province Selection */}
      {selectedCountry && availableStates.length > 0 && (
        <div>
          {showLabels && (
            <Label htmlFor="state" className="mb-2 block">
              {t('checkout.fields.state') || 'State/Province'} {required && '*'}
            </Label>
          )}
          <Select
            value={selectedState || ''}
            onValueChange={handleStateChange}
            disabled={disabled || !selectedCountry}
            required={required}
          >
            <SelectTrigger id="state">
              <SelectValue 
                placeholder={t('checkout.placeholders.selectState') || 'Select state/province'} 
              />
            </SelectTrigger>
            <SelectContent>
              {availableStates.map((state: AramexState) => (
                <SelectItem key={state.code} value={state.code}>
                  <span>{getDisplayName(state.name, state.nameAr)}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* City Selection */}
      {selectedState && availableCities.length > 0 && (
        <div>
          {showLabels && (
            <Label htmlFor="city" className="mb-2 block">
              {t('checkout.fields.city') || 'City'} {required && '*'}
            </Label>
          )}
          <Select
            value={selectedCity || ''}
            onValueChange={handleCityChange}
            disabled={disabled || !selectedState}
            required={required}
          >
            <SelectTrigger id="city">
              <SelectValue 
                placeholder={t('checkout.placeholders.selectCity') || 'Select city'} 
              />
            </SelectTrigger>
            <SelectContent>
              {availableCities.map((city: AramexCity, index) => (
                <SelectItem key={`${city.name}-${index}`} value={city.name}>
                  <span>{getDisplayName(city.name, city.nameAr)}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Info message */}
      {selectedCountry && (
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <span>📦</span>
            <span>
              {t('checkout.info.aramexDelivery') || 'Delivery available via Aramex'}
            </span>
          </div>
          {selectedCountry && (
            <div className="mt-1 text-xs">
              {t('checkout.info.currency')} {ARAMEX_GCC_COUNTRIES.find(c => c.code === selectedCountry)?.currency}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AramexLocationSelector;