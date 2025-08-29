import { redirect } from 'next/navigation';

export default function WizardRedirect() {
  // Wizard functionality now lives on the schedule page.
  redirect('../../schedule');
}
