import { Switch, Route } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import StainRemoval from "@/pages/StainRemoval";
import StainList from "@/pages/StainList";
import MaterialList from "@/pages/MaterialList";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/stains" component={StainList} />
      <Route path="/materials" component={MaterialList} />
      <Route path="/remove/:stain/:material" component={StainRemoval} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <Router />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;
