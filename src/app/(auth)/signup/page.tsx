

import { redirect } from 'next/navigation';

// This page now redirects to the unified login page with the register tab active.
export default function SignupPage() {
    redirect('/login?tab=register');
}
