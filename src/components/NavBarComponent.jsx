import {
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Menu,
    MenuButton,
    MenuItem,
    MenuItems,
} from "@headlessui/react";
import { Bars3Icon, BellIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useState, useEffect } from "react";
import { useFirebase } from "../context/firebase";
import { useNavigate } from "react-router-dom";


function classNames(...classes) {
    return classes.filter(Boolean).join(" ");
}

export default function NavbarComponent({ photo, dname }) {
    const firebase = useFirebase();
    const navigate = useNavigate();

    const { isLoggedIn, currentUser } = useFirebase();
    const [navigation, setNavigation] = useState([{ name: 'About Us', href: '/about', current: false }]);

    const [profileUrl, setProfileUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState({});

    useEffect(() => {
        if (isLoggedIn && currentUser) {

            setNavigation([


                { name: 'About Us', href: '/about', current: false },

            ]);

            const userUID = currentUser.uid;
            const initialUser = [];

            firebase.getUser().then((users) => {
                const BigParent = users.docs;

                for (let snapshot of BigParent) {
                    const user = snapshot.data();

                    if (user.userID === userUID) {
                        initialUser.push(user);
                        break;
                    }
                }

                if (initialUser.length > 0) {
                    firebase.getImageUrl(initialUser[0].coverPic).then((url) => setProfileUrl(url));

                    setUser({
                        name: initialUser[0].userName || currentUser.displayName,
                        email: initialUser[0].userEmail || currentUser.email,
                        imageUrl: profileUrl || currentUser.photoURL,
                    });
                } else {
                    setUser({
                        name: currentUser.displayName,
                        email: currentUser.email,
                        imageUrl: currentUser.photoURL,
                    });
                }
                setLoading(false);
            });
        } else {
            setNavigation([]);
            setLoading(false);
        }
    }, [isLoggedIn, currentUser, profileUrl]);

    const handleNavigationClick = (index) => {
        setNavigation((nav) =>
            nav.map((item, idx) => ({
                ...item,
                current: idx === index,
            }))
        );
    };

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            await firebase.UserLogout();
            alert('Logged out successfully');
        } catch (error) {
            console.error('Logout failed', error);
        }
        navigate('/');
    };


    const userNavigation = [
        { name: 'Settings', href: '#' },
    ];

    return (
        <div className="h-[10%] bg-[#0d0d0d] text-gray-200 border-[#00b8d9] border-b-2">
            {loading ? (
                <div className="flex items-center justify-center h-16">
                    <div className="loader">Loading...</div>
                </div>
            ) : (
                <Disclosure as="nav">
                    {({ open }) => (
                        <>
                            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                                <div className="flex h-16 items-center justify-between">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0" >
                                            <img
                                                className="h-8 w-[fit-content]"
                                                src="https://cdn.dribbble.com/userupload/16673750/file/original-3f2480fd160250a1445f2bdb740fae42.png?resize=1200x257"
                                                alt="Your Company"

                                            />
                                        </div>
                                        <div className="hidden md:block">
                                            <div className="ml-10 flex items-baseline space-x-4">
                                                {navigation.map((item, index) => (
                                                    <a
                                                        key={item.name}
                                                        href={item.href}
                                                        className={classNames(
                                                            item.current ? 'bg-[#333333ff] text-white' : 'text-gray-300 hover:bg-[#333333ff] hover:text-white',
                                                            'rounded-md px-3 py-2 text-sm font-medium',
                                                        )}
                                                        aria-current={item.current ? 'page' : undefined}
                                                        onClick={() => handleNavigationClick(index)}
                                                    >
                                                        {item.name}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {isLoggedIn && currentUser && (
                                        <div className="hidden md:block">
                                            <div className="ml-4 flex items-center md:ml-6">
                                                <button
                                                    type="button"
                                                    className="relative rounded-full bg-[#333333ff] p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                                >
                                                    <span className="sr-only">View notifications</span>
                                                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                                                </button>
                                                <Menu as="div" className="relative ml-3">
                                                    <div>
                                                        <MenuButton className="relative flex max-w-xs items-center rounded-full bg-[#333333ff] text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                                            <span className="sr-only">Open user menu</span>
                                                            <img className="h-8 w-8 rounded-full" src={user.imageUrl} alt="" />
                                                        </MenuButton>
                                                    </div>
                                                    <MenuItems
                                                        transition
                                                        className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-[#333333ff] py-1 shadow-lg ring-1 ring-black ring-opacity-5 transition focus:outline-none"
                                                    >
                                                        <div className="block px-4 py-2 text-sm font-medium leading-none text-white">{user.name}</div>
                                                        {userNavigation.map((item) => (
                                                            <MenuItem key={item.name}>
                                                                {({ active }) => (
                                                                    <a
                                                                        href={item.href}
                                                                        className={classNames(
                                                                            active ? 'bg-[#333333ff]' : '',
                                                                            'block px-4 py-2 text-sm text-gray-200',
                                                                        )}
                                                                    >
                                                                        {item.name}
                                                                    </a>
                                                                )}
                                                            </MenuItem>
                                                        ))}


                                                        <button className='block px-4 py-2 text-sm text-gray-200' onClick={handleLogout}>
                                                            Log Out
                                                        </button>
                                                    </MenuItems>
                                                </Menu>
                                            </div>
                                        </div>
                                    )}
                                    <div className="-mr-2 flex md:hidden">
                                        <DisclosureButton className="relative inline-flex items-center justify-center rounded-md bg-[#333333ff] p-2 text-gray-400 hover:bg-[#333333ff] hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                                            <span className="sr-only">Open main menu</span>
                                            {open ? (
                                                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                                            ) : (
                                                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                                            )}
                                        </DisclosureButton>
                                    </div>
                                </div>
                            </div>
                            <DisclosurePanel className="md:hidden">
                                <div className="space-y-1 px-2 pb-3 pt-2 sm:px-3">
                                    {navigation.map((item, index) => (
                                        <DisclosureButton
                                            key={item.name}
                                            as="a"
                                            href={item.href}
                                            className={classNames(
                                                item.current ? 'bg-[#333333ff] text-white' : 'text-gray-300 hover:bg-[#333333ff] hover:text-white',
                                                'block rounded-md px-3 py-2 text-base font-medium',
                                            )}
                                            aria-current={item.current ? 'page' : undefined}
                                            onClick={() => handleNavigationClick(index)}
                                        >
                                            {item.name}
                                        </DisclosureButton>
                                    ))}
                                </div>
                                {isLoggedIn && currentUser && (
                                    <div className="border-t border-gray-700 pb-3 pt-4">
                                        <div className="flex items-center px-5">
                                            <div className="flex-shrink-0">
                                                <img className="h-10 w-10 rounded-full object-cover" src={user.imageUrl} alt="" />
                                            </div>
                                            <div className="ml-3">
                                                <div className="text-base font-medium leading-none text-white">{user.name}</div>
                                                <div className="text-sm font-medium leading-none text-gray-400">{user.email}</div>
                                            </div>
                                            <button
                                                type="button"
                                                className="relative ml-auto flex-shrink-0 rounded-full bg-[#333333ff] p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                                            >
                                                <span className="sr-only">View notifications</span>
                                                <BellIcon className="h-6 w-6" aria-hidden="true" />
                                            </button>
                                        </div>
                                        <div className="mt-3 space-y-1 px-2">
                                            {userNavigation.map((item) => (
                                                <DisclosureButton
                                                    key={item.name}
                                                    as="a"
                                                    href={item.href}
                                                    className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-[#333333ff] hover:text-white"
                                                >
                                                    {item.name}
                                                </DisclosureButton>
                                            ))}

                                            <DisclosureButton
                                                as="button"
                                                className="block rounded-md px-3 py-2 text-base font-medium text-gray-400 hover:bg-[#333333ff] hover:text-white"
                                                onClick={handleLogout}
                                            >
                                                Log Out
                                            </DisclosureButton>
                                        </div>
                                    </div>
                                )}
                            </DisclosurePanel>
                        </>
                    )}
                </Disclosure>
            )}
        </div>
    );
}