import api from "../api";
import { useState, useEffect } from "react";
import {useCareerStore} from "../store/useCareerStore";
import CareerCard from "../components/CareerCard"
const CareerPathPage = () => {
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectedSlug } = useCareerStore();

  const fetchPaths = async () => {
    try {
      const res = await api.get("/skills/career-paths/");
      setCareers(res.data); // ✅ correct
    } catch (err) {
      console.error("Error fetching careers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaths(); // ✅ no chaining
  }, []);

  if (loading) return <div className="p-6">Loading careers...</div>;

  return (
    <div className="max-w-6xl mx-auto p-6 grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {careers.map((path) => (
        <CareerCard 
          key={path.slug} 
          path={path} 
          isSelected={selectedSlug === path.slug}
          />
      ))}
    </div>
  );
};

export default CareerPathPage;