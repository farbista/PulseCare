// client/src/pages/Dashboard.tsx
import { useState, useEffect } from "react";
import ProfilePage from "@/pages/ProfilePage";
import { useAuth } from "@/context/AuthContext";
import { donorApi } from "@/api/donor"; // Import the donor API
import { DonorData } from "../types/donor";

// Mock data for testing
const mockDonorData: DonorData = {
  id: "1",
  name: "John Doe",
  bloodType: "O+",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  address: "123 Main St, Anytown, USA",
  profileImage: "",
  coverImage: "",
  lastDonation: "2023-05-15",
  totalDonations: 8,
  nextEligibleDate: "2023-11-15",
  available: true,
  bio: "Passionate about making a difference through blood donation. I've been donating regularly for the past 5 years and encourage others to join this life-saving cause.",
  personalInfo: {
    age: 32,
    gender: "Male",
    weight: "75 kg",
    height: "180 cm",
  },
  education: [
    {
      id: "1",
      degree: "Bachelor of Science in Computer Science",
      institution: "University of Technology",
      year: "2010-2014",
    },
    {
      id: "2",
      degree: "Master of Business Administration",
      institution: "Business School",
      year: "2015-2017",
    },
  ],
  work: [
    {
      id: "1",
      position: "Software Developer",
      company: "Tech Solutions Inc.",
      duration: "2014-2018",
    },
    {
      id: "2",
      position: "Senior Software Engineer",
      company: "Digital Innovations Ltd.",
      duration: "2018-Present",
    },
  ],
  donationHistory: [
    {
      id: "1",
      date: "2023-05-15",
      location: "City Blood Bank",
      bloodType: "O+",
      volume: "450",
    },
    {
      id: "2",
      date: "2022-11-20",
      location: "Community Hospital",
      bloodType: "O+",
      volume: "450",
    },
    {
      id: "3",
      date: "2022-05-10",
      location: "Red Cross Center",
      bloodType: "O+",
      volume: "450",
    },
  ],
  testimonials: [
    {
      id: "1",
      name: "Sarah Johnson",
      role: "Blood Bank Coordinator",
      content: "John has been a consistent donor for over 5 years. His commitment to saving lives is truly inspiring.",
      avatar: "",
      rating: 4.8,
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      role: "Hospital Director",
      content: "We always appreciate John's donations. He's a valuable member of our community of lifesavers.",
      avatar: "",
      rating: 4.5,
    },
  ],
  socialLinks: {
    linkedin: "https://linkedin.com/in/johndoe",
    twitter: "https://twitter.com/johndoe",
    github: "https://github.com/johndoe",
    instagram: "https://instagram.com/johndoe",
    facebook: "https://facebook.com/johndoe",
    portfolio: "https://johndoe.dev",
  },
};

const Dashboard = () => {
  const { user } = useAuth();
  const [donorData, setDonorData] = useState<DonorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDonorData = async () => {
      try {
        setLoading(true);
        
        // Always use mock data for now to bypass authentication issues
        // This will allow us to see the UI and work on other features
        const userData = {
          ...mockDonorData,
          // If user is available, use their info, otherwise use mock data
          name: user?.fullName || mockDonorData.name,
          email: user?.email || mockDonorData.email,
          profileImage: user?.profilePicture || mockDonorData.profileImage,
        };
        
        setDonorData(userData);
      } catch (err) {
        console.error("Error fetching donor profile:", err);
        setError("Failed to load donor profile");
      } finally {
        setLoading(false);
      }
    };

    fetchDonorData();
  }, [user]);

  const handleUpdateProfile = (updatedData: Partial<DonorData>) => {
    if (donorData) {
      // Update the local state immediately
      const newDonorData = {
        ...donorData,
        ...updatedData,
      };
      setDonorData(newDonorData);
      
      // In a real app, you would also save to your backend here
      console.log("Profile updated successfully:", updatedData);
    }
  };

  const handleToggleAvailability = (available: boolean) => {
    if (donorData) {
      // Update the local state immediately
      const newDonorData = {
        ...donorData,
        available,
      };
      setDonorData(newDonorData);
      
      // In a real app, you would also save to your backend here
      console.log(`Availability updated to: ${available ? "Available" : "Not Available"}`);
    }
  };

  const handleProfileImageUpload = (file: File) => {
    // In a real app, you would upload the file to your server
    // For now, we'll just create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      if (donorData) {
        setDonorData({
          ...donorData,
          profileImage: reader.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
    
    console.log("Profile image uploaded:", file.name);
  };

  const handleCoverImageUpload = (file: File) => {
    // In a real app, you would upload the file to your server
    // For now, we'll just create a preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      if (donorData) {
        setDonorData({
          ...donorData,
          coverImage: reader.result as string,
        });
      }
    };
    reader.readAsDataURL(file);
    
    console.log("Cover image uploaded:", file.name);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600">Error</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!donorData) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">No donor data available</h2>
        </div>
      </div>
    );
  }

  return (
    <ProfilePage 
      donorData={donorData} 
      onUpdateProfile={handleUpdateProfile}
      onToggleAvailability={handleToggleAvailability}
      onProfileImageUpload={handleProfileImageUpload}
      onCoverImageUpload={handleCoverImageUpload}
      isOwnProfile={true}
    />
  );
};

export default Dashboard;