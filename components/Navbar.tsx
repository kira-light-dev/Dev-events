import Link from 'next/link';

const Navbar = () => {
    return (
        <header>
            <nav>
                <Link href="/" className="logo">
                    <img src="/icons/logo.png" alt="logo" width={24} height={24} />
                </Link>

                <ul>
                    <li><Link href="/">Home</Link></li>
                    <li><Link href="/events">Events</Link></li>
                    <li><Link href="/Create-events">Create Events</Link></li>
                </ul>
            </nav>
        </header>
    );
};

export default Navbar;
