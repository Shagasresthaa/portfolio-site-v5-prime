import Image from "next/image";
import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="font-body w-full bg-[rgba(10,25,47,0.65)] text-white backdrop-blur-md">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-center gap-4">
          {/* Top row: DigitalOcean | Copyright | Cloudflare */}
          <div className="flex flex-row items-center justify-center gap-4 md:gap-8">
            {/* DigitalOcean - Left */}
            <Link
              href="https://www.digitalocean.com/?refcode=85f458f92f16&utm_campaign=Referral_Invite&utm_medium=Referral_Program&utm_source=badge"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-transform hover:scale-105"
            >
              <Image
                src="https://web-platforms.sfo2.cdn.digitaloceanspaces.com/WWW/Badge%202.svg"
                alt="DigitalOcean Referral Badge"
                width={200}
                height={50}
                className="h-8 w-auto md:h-12"
              />
            </Link>

            {/* Copyright - Center */}
            <div
              className="text-center"
              style={{ fontFamily: "var(--font-kalam)" }}
            >
              <span className="text-xs font-semibold md:text-sm">
                © Shaga Sresthaa, {currentYear}
              </span>
            </div>

            {/* Cloudflare - Right */}
            <div className="transition-transform hover:scale-105">
              <Image
                src="https://cf-assets.www.cloudflare.com/dzlvafdwdttg/69wNwfiY5mFmgpd9eQFW6j/d5131c08085a977aa70f19e7aada3fa9/1pixel-down__1_.svg"
                alt="Secured by Cloudflare"
                width={180}
                height={50}
                className="h-6 w-auto md:h-10"
              />
            </div>
          </div>

          {/* Bottom row: Docker logo */}
          <div className="transition-transform hover:scale-105">
            <Image
              src="/assets/docker-logo-blue.svg"
              alt="Powered by Docker"
              width={120}
              height={40}
              className="h-6 w-auto md:h-8"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
