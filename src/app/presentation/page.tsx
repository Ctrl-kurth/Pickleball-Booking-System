import { SlideEngine } from '@/components/presentation/SlideEngine';
import { HeroSlide } from '@/components/presentation/slides/HeroSlide';
import { FeaturesSlide } from '@/components/presentation/slides/FeaturesSlide';

export default function PresentationPage() {
  const slides = [
    <HeroSlide key="hero" />,
    <FeaturesSlide key="features" />,
    // Additional slides can be added here
  ];

  return <SlideEngine slides={slides} />;
}
