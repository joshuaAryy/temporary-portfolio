import type { ReactNode } from 'react';
import Visuals from './Visuals';
import silico from './assets/living-in-silico-logo.webp';
import stush from './assets/stush-logo.webp';
import food from './assets/food-tracker-logo.webp';

function WorkLink({ href, image, children }: { href: string; image?: string; children: ReactNode }) {
  return <a className="work-link" href={href}>
    {image && <img src={image} alt="" width="20" height="20" />}{children}
  </a>;
}

export default function App() {
  return <main className="page">
    <div className="written">
    <h1>Joshua Aryeetey</h1>
    <p className="intro">
      I’m studying Computer Engineering (Software Specialization) at Toronto Metropolitan University,
      with an interest in software engineering, AI and machine learning. I’ve interned at{' '}
      <WorkLink href="https://livinginsilico.ca/" image={silico}>Living in Silico</WorkLink> and{' '}
      <WorkLink href="https://stushfoods.com/" image={stush}>Stush Patties</WorkLink>.
      Outside of that, I’ve been building{' '}
      <WorkLink href="https://github.com/joshuaAryy/food-tracker" image={food}>Food Tracker</WorkLink> and
      collaborating on <WorkLink href="https://github.com/ShivGitHub1-n/Application-Cho-Viego">Cho&apos;Veigo</WorkLink>.
      I also helped build <WorkLink href="https://devpost.com/software/crest-kglqay">Crest</WorkLink>,
      which placed 3rd in the Brim Financial Challenge at MPC Hacks.
    </p>
    <ul className="socials" aria-label="Find me online">
      <li><a href="https://github.com/joshuaAryy">GitHub</a></li>
      <li><a href="https://www.linkedin.com/in/joshua-ary">LinkedIn</a></li>
      <li><a href="/resume.pdf">Resume <span aria-hidden="true" className="resume-arrow">↗</span></a></li>
      <li><a href="https://x.com/Cartizionplane">X</a></li>
      <li><a href="mailto:joshuaaryy@gmail.com">Email</a></li>
    </ul>
    </div>
    <Visuals />
  </main>;
}
