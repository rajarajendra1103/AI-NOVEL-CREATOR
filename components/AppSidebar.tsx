
import React from 'react';
import { Novel, View } from '../types';
import { HomeIcon, BookOpenIcon, UsersIcon, LinkIcon, SettingsIcon, ClockIcon, GlobeAltIcon } from './icons';

interface AppSidebarProps {
    activeNovel: Novel | undefined;
    activeView: View;
    onSetView: (view: View) => void;
    onGoToDashboard: () => void;
    isMobileMenuOpen: boolean;
    onCloseMobileMenu: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}> = ({ icon, label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors ${
        isActive ? 'bg-accent text-white' : 'text-slate-300 hover:bg-white/10 hover:text-white'
      }`}
    >
      <span className="mr-3">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
};

const AppSidebar: React.FC<AppSidebarProps> = ({
    activeNovel,
    activeView,
    onSetView,
    onGoToDashboard,
    isMobileMenuOpen,
    onCloseMobileMenu,
}) => {
    const handleNavItemClick = (view?: View) => {
        if (view) {
            onSetView(view);
        } else {
            onGoToDashboard();
        }
        onCloseMobileMenu();
    }
    
    const sidebarContent = (
        <div className="w-64 bg-slate-800 p-6 flex flex-col flex-shrink-0 h-full text-white bg-gradient-to-b from-purple-900 via-slate-800 to-slate-900">
            <div className="mb-8">
                <h1 className="text-2xl font-bold font-serif bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                    AI Novel Creator
                </h1>
            </div>
            <nav className="flex flex-col space-y-2 flex-grow">
                <NavItem
                    icon={<HomeIcon className="w-5 h-5" />}
                    label="Dashboard"
                    isActive={!activeNovel}
                    onClick={() => handleNavItemClick()}
                />

                {activeNovel && (
                    <>
                        <div className="pt-4 mt-4 border-t border-white/10">
                             <p className="px-4 text-sm font-semibold text-slate-400 mb-2 truncate" title={activeNovel.title}>{activeNovel.title}</p>
                             <NavItem
                                icon={<HomeIcon className="w-5 h-5" />}
                                label="Overview"
                                isActive={activeView === 'overview'}
                                onClick={() => handleNavItemClick('overview')}
                             />
                            <NavItem
                                icon={<BookOpenIcon className="w-5 h-5" />}
                                label="Chapters"
                                isActive={activeView === 'outline'}
                                onClick={() => handleNavItemClick('outline')}
                            />
                            <NavItem
                                icon={<UsersIcon className="w-5 h-5" />}
                                label="Characters"
                                isActive={activeView === 'characters'}
                                onClick={() => handleNavItemClick('characters')}
                            />
                            <NavItem
                                icon={<LinkIcon className="w-5 h-5" />}
                                label="Relationships"
                                isActive={activeView === 'relationships'}
                                onClick={() => handleNavItemClick('relationships')}
                            />
                             <NavItem
                                icon={<ClockIcon className="w-5 h-5" />}
                                label="Timeline"
                                isActive={activeView === 'timeline'}
                                onClick={() => handleNavItemClick('timeline')}
                            />
                             <NavItem
                                icon={<GlobeAltIcon className="w-5 h-5" />}
                                label="Worldbuilding"
                                isActive={activeView === 'worldbuilding'}
                                onClick={() => handleNavItemClick('worldbuilding')}
                            />
                             <NavItem
                                icon={<SettingsIcon className="w-5 h-5" />}
                                label="Settings"
                                isActive={activeView === 'settings'}
                                onClick={() => handleNavItemClick('settings')}
                            />
                        </div>
                    </>
                )}
            </nav>
            <div className="flex-shrink-0 border-t border-white/10 pt-4">
                <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full" src="https://i.pravatar.cc/150?u=author" alt="Author" />
                    <div className="ml-3">
                        <p className="text-sm font-medium text-white">Author Name</p>
                        <p className="text-xs text-slate-400">View profile</p>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="hidden md:block">
            {sidebarContent}
        </div>
    );
};

export default AppSidebar;