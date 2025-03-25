import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-white shadow-inner">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:justify-start md:order-2">
            <Link href="#">
              <a className="text-neutral-500 hover:text-neutral-800 mx-3">About</a>
            </Link>
            <Link href="#">
              <a className="text-neutral-500 hover:text-neutral-800 mx-3">Privacy</a>
            </Link>
            <Link href="#">
              <a className="text-neutral-500 hover:text-neutral-800 mx-3">Terms</a>
            </Link>
            <Link href="#">
              <a className="text-neutral-500 hover:text-neutral-800 mx-3">Contact</a>
            </Link>
          </div>
          <div className="mt-8 md:mt-0 md:order-1 flex justify-center md:justify-start">
            <p className="text-center text-sm text-neutral-500">
              &copy; {new Date().getFullYear()} LifeShare Blood Donation Platform. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
