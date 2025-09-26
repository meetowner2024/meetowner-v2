"use client";
import { useState } from "react";
import axios from "axios";
import {
  ChevronDown,
  ChevronUp,
  Mail,
  Phone,
  MessageSquare,
  User,
} from "lucide-react";
const faqsData = [
  {
    id: 1,
    question: "How secure is my data with MeetOwner?",
    answer:
      "meetowner.in prioritizes data security with encryption protocols and strict privacy policies.",
  },
  {
    id: 2,
    question: "How are builder and channel partner accounts verified?",
    answer:
      "Builders and channel partners must provide valid business registration details, RERA (if applicable), and identity verification before account approval.",
  },
  {
    id: 3,
    question: "How does MeetOwner verify properties?",
    answer:
      "MeetOwner conducts basic verification, including checking property documents uploaded by owners.",
  },
  {
    id: 4,
    question: "How long does it take for project approval on MeetOwner?",
    answer: "Project approval typically takes 24 to 48 hours after submission.",
  },
  {
    id: 5,
    question: "Account & Login Issues",
    children: [
      {
        id: 1,
        question: "What should I do if I face login issues?",
        answer:
          "Ensure you are using the correct Phone Number linked to your account. If you are a Builder or Channel Partner, you will receive a 6-digit OTP for login. If you are a User or Buyer, you will receive a 4-digit OTP for login.",
      },
      {
        id: 2,
        question: "How can I reach MeetOwner for login or account issues?",
        answer:
          "Email: support@meetowner.in\nPhone: +91-9701888071\nLive Chat: Available on the website for instant support.",
      },
    ],
  },
];
export default function ContactUs() {
  const [expanded, setExpanded] = useState(null);
  const [childExpanded, setChildExpanded] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    message: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const toggleFAQ = (id) => {
    setExpanded(expanded === id ? null : id);
    if (expanded !== id) setChildExpanded(null);
  };
  const toggleChildFAQ = (childId) => {
    setChildExpanded(childExpanded === childId ? null : childId);
  };
  const handleChange = (name, value) => {
    setFormData({ ...formData, [name]: value });
  };
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.message.trim()) newErrors.message = "Message cannot be empty";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSubmit = () => {
    if (!validateForm()) return;
    setIsSubmitting(true);
    axios
      .post("https://api.meetowner.in/enquiry/v1/contactUs", formData)
      .then((response) => {
        setIsSubmitting(false);
        setToast("Request Submitted!");
        setFormData({ name: "", mobile: "", email: "", message: "" });
      })
      .catch((error) => {
        setIsSubmitting(false);
        setToast("Something went wrong! Please try again later.");
      });
  };
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 text-center mb-10">
          Frequently Asked Questions
        </h1>
        <div className="space-y-4 mb-12">
          {faqsData.map((faq) => (
            <div
              key={faq.id}
              className="bg-white shadow-sm rounded-lg border border-gray-200 transition-all duration-300 hover:shadow-md"
            >
              <button
                onClick={() => toggleFAQ(faq.id)}
                className="flex justify-between items-center w-full p-4 text-left text-lg font-medium text-gray-900"
              >
                <span>{faq.question}</span>
                {expanded === faq.id ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              {expanded === faq.id && (
                <div className="px-4 pb-4 text-left">
                  {faq.children ? (
                    <div className="space-y-3">
                      {faq.children.map((child) => (
                        <div
                          key={child.id}
                          className="bg-gray-50 rounded-lg border border-gray-200 p-3"
                        >
                          <button
                            onClick={() => toggleChildFAQ(child.id)}
                            className="flex justify-between items-center w-full text-left text-base font-medium text-gray-800"
                          >
                            <span>{child.question}</span>
                            {childExpanded === child.id ? (
                              <ChevronUp className="w-4 h-4 text-gray-500" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-500" />
                            )}
                          </button>
                          {childExpanded === child.id && (
                            <p className="mt-2 text-gray-600 text-sm whitespace-pre-line">
                              {child.answer}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm">{faq.answer}</p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">Get in Touch</h2>
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="w-full lg:w-2/3">
            <div className="bg-white shadow-sm rounded-lg p-6">
              <div className="space-y-4">
                <div className="relative">
                  <User className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
                <div className="relative">
                  <Phone className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    placeholder="Mobile Number"
                    value={formData.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div className="relative">
                  <Mail className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <div className="relative">
                  <MessageSquare className="absolute top-3 left-3 w-5 h-5 text-gray-400" />
                  <textarea
                    placeholder="Your Message"
                    value={formData.message}
                    onChange={(e) => handleChange("message", e.target.value)}
                    rows={4}
                    className={`w-full pl-10 pr-4 py-2 rounded-lg border ${
                      errors.message ? "border-red-500" : "border-gray-300"
                    } focus:outline-none focus:ring-2 focus:ring-blue-500 transition`}
                  ></textarea>
                  {errors.message && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.message}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium text-white ${
                    isSubmitting
                      ? "bg-[#1D3A76] cursor-not-allowed"
                      : "bg-[#1D3A76] hover:bg-blue-700"
                  } transition duration-200`}
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8v-8H4z"
                        />
                      </svg>
                      Submitting...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
                {toast && (
                  <p
                    className={`text-sm text-center ${
                      toast.includes("Something went wrong")
                        ? "text-red-500"
                        : "text-green-600"
                    }`}
                  >
                    {toast}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/3">
            <div className="bg-white shadow-sm rounded-lg p-6 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-green-100 rounded-full p-3">
                  <Phone className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Customer Support
              </h3>
              <p className="text-gray-600 mb-2 flex items-center justify-center gap-2">
                <Phone className="w-4 h-4" /> +91 9553919919
              </p>
              <p className="text-gray-600 flex items-center justify-center gap-2">
                <Mail className="w-4 h-4" /> meetowner.in@gmail.com
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}