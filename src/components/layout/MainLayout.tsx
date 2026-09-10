import { ReactNode } from "react";
import Header from "./Header";
import Footer from "./Footer";

import { useAuth } from "@/context/AuthContext";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user } = useAuth();
  const isArtist = user?.role === 'artist';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {!isArtist && <Footer />}
    </div>
  );
};

export default MainLayout;
