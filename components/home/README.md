# Home Page Components

This directory contains all the components used to build the NextShyft home page. Each component is designed to be modular and reusable.

## Components

### HeroSection

- **Purpose**: Main hero section with headline, description, and call-to-action buttons
- **Features**: Responsive layout, social proof elements, primary CTA buttons
- **Props**: None (self-contained)

### QuickFeatures

- **Purpose**: Quick overview of three main features in a grid layout
- **Features**: Fast scheduling, team communication, automated workflows
- **Props**: None (self-contained)

### FeaturesSection

- **Purpose**: Detailed feature showcase with icons and descriptions
- **Features**: Smart Scheduling, Real-time Notifications, Advanced Analytics, Enterprise Security
- **Props**: None (self-contained)

### PricingSection

- **Purpose**: Three-tier pricing structure with feature comparisons
- **Features**: Starter ($29), Professional ($79), Enterprise (Custom)
- **Props**: None (self-contained)

### ContactSection

- **Purpose**: Contact form and company information
- **Features**: Contact form, company details, support information
- **Props**: None (self-contained)

### CTASection

- **Purpose**: Final call-to-action section with gradient background
- **Features**: Gradient background, dual CTA buttons
- **Props**: None (self-contained)

## Usage

```tsx
import {
  HeroSection,
  QuickFeatures,
  FeaturesSection,
  PricingSection,
  ContactSection,
  CTASection,
} from '../components/home';

export default function HomePage() {
  return (
    <Container maxWidth="lg">
      <Stack spacing={8}>
        <HeroSection />
        <QuickFeatures />
        <FeaturesSection />
        <PricingSection />
        <ContactSection />
        <CTASection />
      </Stack>
    </Container>
  );
}
```

## Benefits of This Structure

1. **Modularity**: Each section is a separate component that can be easily modified
2. **Reusability**: Components can be reused in other parts of the application
3. **Maintainability**: Easier to maintain and update individual sections
4. **Testing**: Each component can be tested independently
5. **Performance**: Better code splitting and lazy loading opportunities
6. **Team Collaboration**: Different developers can work on different components simultaneously

## Styling

All components use Material-UI (MUI) components and follow the existing design system. The styling is consistent with the rest of the application using the `sx` prop for custom styles.
