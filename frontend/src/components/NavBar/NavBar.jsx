import { Logo } from "./logo";
import Link from "next/link";
import Image from "next/image";

const NavBar = ({ zoneId }) => {
    return (
        <div className="">
            <nav className="h-16 bg-background border-b">
                <div className="h-full flex items-center justify-between mx-auto px-4 sm:px-6 lg:px-8 bg-[#001d67]">
                    <Link href="/">
                        <Logo />
                    </Link>

                    {zoneId &&
                        <div className="flex items-center gap-3 text-lg font-bold text-gray-500">
                            <span>Visualización de {zoneId}</span>
                        </div>
                    }

                    <div className="flex items-center gap-3">
                        <Image src="/tmc_logo.png" alt="TMC" width={128} height={128} />
                    </div>
                </div>
            </nav>
        </div>
    );
};

export default NavBar;
