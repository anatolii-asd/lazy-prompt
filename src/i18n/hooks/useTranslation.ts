import { useTranslation as useTranslationContext } from '../index';

export function useTranslation() {
  return useTranslationContext();
}

export default useTranslation;