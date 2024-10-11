"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import filter_alt from "@/assets/images/filter_alt.png";
import sort from "@/assets/images/sort.png";
import share from "@/assets/images/share.png";
import Refresh from "@/assets/images/Refresh.png";
import search from "@/assets/images/searchIcon.png";
import TrademarkList from "@/components/TrademarkList";
import imageNotAvailable from "@/assets/images/ImageNotAvailable.png";

interface Trademark {
  id: number;
  mark_identification: string;
  status: string;
  owner: string;
  description: string;
  date: string;
  renewal_date: string;
  lawFirms: string;
  attorneys: string;
}

interface Owner {
  owner: string;
}
interface Lawfirms {
  lawFirms: string;
}
interface Attorneys {
  attorneys: string;
}

export default function Home() {
  const [trademarks, setTrademarks] = useState<Trademark[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [lawFirms, setLawFirms] = useState<Lawfirms[]>([]); // State for law firms
  const [attorneys, setAttorneys] = useState<Attorneys[]>([]); // State for attorneys
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [selectedLawFirms, setSelectedLawFirms] = useState<string[]>([]); // State for selected law firms
  const [selectedAttorneys, setSelectedAttorneys] = useState<string[]>([]); // State for selected attorneys
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null); // State for selected status
  const [viewType, setViewType] = useState<"grid" | "list">("list"); // Default to list view
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "owners" | "lawFirms" | "attorneys"
  >("owners"); // Active tab state
  const [loading, setLoading] = useState(false);

  const handleViewChange = (type: "grid" | "list") => {
    setViewType(type);
  };

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    throw new Error(
      "API URL is not defined. Please set NEXT_PUBLIC_API_URL in your .env file."
    );
  }

  const [filters, setFilters] = useState({
    input_query: "",
    input_query_type: "",
    status: [],
    owners: "",
    sort_order: "desc",
  });

  const statuses = [
    { label: "All", value: null, background: "bg-white" },
    { label: "Registered", value: "registered", background: "bg-success" },
    { label: "Pending", value: "pending", background: "bg-warning" },
    { label: "Abandoned", value: "abandoned", background: "bg-danger" },
    { label: "Others", value: "others", background: "bg-primary" },
  ];

  const handleInputChange = (e: any) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  function formatDate(dateString: number) {
    const date = new Date(dateString * 1000);
    const day = date.getDate();

    const daySuffix = (day: number) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
    };
    const formattedDate = date.toLocaleDateString("en-US", options);

    return `${day}${daySuffix(day)} ${formattedDate}`; // Combine day, suffix, month, and year
  }

  const handleSearch = async () => {
    setLoading(true);
    // Check if the input query is empty
    if (!filters.input_query) {
      setTrademarks([]); // Set trademarks to an empty array or handle it as needed
      setLoading(false); // Set loading to false
      return; // Exit the function early
    }
    try {
      const response = await axios.post(apiUrl, {
        input_query: filters.input_query || "",
        input_query_type: filters.input_query_type || "",
        sort_by: "default",
        status: filters.status.length ? filters.status : [],
        exact_match: false,
        date_query: false,
        owners: filters.owners
          ? filters.owners.split(",").map((owner) => owner.trim())
          : [],
        attorneys: [],
        law_firms: [],
        mark_description_description: [],
        classes: [],
        page: 1,
        rows: 10,
        sort_order: filters.sort_order || "desc",
        states: [],
        counties: [],
      });

      // Extract the required data
      const hits = response.data.body.hits.hits;

      const nameOwner = Array.from(
        new Set(hits.map((hit: any) => hit._source.search_bar.owner))
      ).map((owner) => ({ owner: owner as string })); // Type assertion here

      // Here, you would extract and set law firms and attorneys in a similar way
      const nameLawFirms = Array.from(
        new Set(hits.map((hit: any) => hit._source.search_bar.law_firm))
      ).map((lawFirms) => ({ lawFirms: lawFirms as string }));

      const nameAttorneys = Array.from(
        new Set(hits.map((hit: any) => hit._source.search_bar.attorneys))
      ).map((attorneys) => ({ attorneys: attorneys as string }));

      setLawFirms(nameLawFirms);
      setAttorneys(nameAttorneys);

      setOwners(nameOwner);

      const parsedTrademarks = hits.map((hit: any) => ({
        id: hit._id,
        status: hit._source.status_type || "Unknown",
        mark_identification: hit._source.search_bar.mark_identification,
        owner: hit._source.search_bar.owner,
        description:
          hit._source.mark_description_description.join(", ") ||
          "No description available",
        date: formatDate(hit._source.registration_date),
        renewal_date: formatDate(hit._source.renewal_date),
        lawFirms: hit._source.search_bar.law_firm,
        attorneys: hit._source.search_bar.attorneys,
      }));

      setTrademarks(parsedTrademarks);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSuggestion = (suggestion: string) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      input_query: suggestion,
    }));
  };

  function generateSuggestions(query: string) {
    if (!query || query.length < 2 || query.startsWith("*")) {
      return [];
    }

    const firstCharReplaced = `*${query.slice(0)}`;
    const lastCharReplaced = `*${query.slice(1)}`;
    return [firstCharReplaced, lastCharReplaced];
  }

  const handleOwnerChange = (owner: string) => {
    setSelectedOwners((prevSelectedOwners) => {
      console.log(prevSelectedOwners, owner);

      if (prevSelectedOwners.includes(owner)) {
        return prevSelectedOwners.filter(
          (selectedOwner) => selectedOwner !== owner
        );
      } else {
        return [owner, ...prevSelectedOwners];
      }
    });
  };

  const handleLawFirmChange = (firm: string) => {
    setSelectedLawFirms((prevSelectedLawFirms) => {
      if (prevSelectedLawFirms.includes(firm)) {
        return prevSelectedLawFirms.filter(
          (selectedFirm) => selectedFirm !== firm
        );
      } else {
        return [...prevSelectedLawFirms, firm];
      }
    });
  };

  const handleAttorneyChange = (attorney: string) => {
    setSelectedAttorneys((prevSelectedAttorneys) => {
      if (prevSelectedAttorneys.includes(attorney)) {
        return prevSelectedAttorneys.filter(
          (selectedAttorney) => selectedAttorney !== attorney
        );
      } else {
        return [...prevSelectedAttorneys, attorney];
      }
    });
  };
  console.log(selectedAttorneys.length);

  const handleStatusChange = (status: string | null) => {
    if (selectedStatus === status) {
      setSelectedStatus(null); // Deselect if the same status is clicked again
    } else {
      setSelectedStatus(status); // Set the selected status
    }
  };

  const handleTabChange = (tab: "owners" | "lawFirms" | "attorneys") => {
    setActiveTab(tab); // Change the active tab
  };

  useEffect(() => {
    handleSearch(); // Fetch data on component mount
  }, []);

  useEffect(() => {
    // If no filters are selected, we can refetch the data
    if (
      selectedOwners.length === 0 &&
      !selectedStatus &&
      selectedLawFirms.length === 0 &&
      selectedAttorneys.length === 0
    ) {
      handleSearch(); // Re-fetch if no filters are selected
      return; // Exit the useEffect early
    }

    // Start with the full list of trademarks
    let filteredTrademarks = trademarks;

    // Filter by owners if any are selected
    if (selectedOwners.length > 0) {
      filteredTrademarks = filteredTrademarks.filter((trademark) =>
        selectedOwners.includes(trademark.owner)
      );
    }

    // Filter by status if one is selected
    if (selectedStatus) {
      filteredTrademarks = filteredTrademarks.filter(
        (trademark) => trademark.status === selectedStatus
      );
    }

    // Filter by law firms if any are selected
    if (selectedLawFirms.length > 0) {
      filteredTrademarks = filteredTrademarks.filter((trademark) =>
        selectedLawFirms.includes(trademark.lawFirms)
      );
    }

    // Filter by attorneys if any are selected
    if (selectedAttorneys.length > 0) {
      filteredTrademarks = filteredTrademarks.filter((trademark) =>
        selectedAttorneys.includes(trademark.attorneys)
      );
    }

    // Update the trademarks state with the filtered results
    setTrademarks(filteredTrademarks);
  }, [selectedOwners, selectedStatus, selectedLawFirms, selectedAttorneys]);

  const handleShare = () => {
    const subject = "Shared Trademarks";
    const trademarksList = trademarks
      .map((trademark) => {
        return `- ${trademark.mark_identification} (Owner: ${trademark.owner}, Status: ${trademark.status})`;
      })
      .join("\n");

    const body = `Hello,\n\nHere are the trademarks I found:\n\n${trademarksList}\n\nBest regards,\nYour Name`;

    const mailtoLink = `mailto:?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    // Open the mail client
    window.location.href = mailtoLink;
  };

  useEffect(() => {
    // Ensure this only runs in the client (browser)
    const handleResize = () => {
      if (typeof window !== "undefined") {
        setIsMobile(window.innerWidth < 768);
      }
    };

    // Set initial value
    handleResize();

    // Update on window resize
    window.addEventListener("resize", handleResize);

    // Cleanup on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="container mx-auto bg-white  overflow-hidden">
      {/* Search Section */}
      <div className="flex flex-col items-start gap-8 p-8 bg-lightening md:flex-row md:justify-start overflow-hidden">
        {/* Logo/Image Section */}
        <div className="p-2">
          <img
            height={200}
            width={200}
            src="https://s3-alpha-sig.figma.com/img/29e3/a292/59a6875d50b71e2c1320ab20e9a4c855?Expires=1729468800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=WAoNr9xVG4h-TXEoC0tRFTZsTMW3L32Q2o-Jao1jDFHJ74Fap9NyqYRYL-OzOAZfUn-1oD5YKVX5gqcha~DOloBCXO4fwrNXynhfgHNJb8rzvP1pW9~JdgDxqQAa~e4HRXcGb6KhP2dLu4~NYsHVmlkMbhZLtr3yQGWeGFze-zHqAofth35x3RoOtAPyAWp13fd~lG-QH~k7UO2u1rdlW33X94HJlJo5cY1ibBzYjCIUu09W72KauNIJdic0-Cg5WmVFouEUASgsJbeiha6X-Vi4ZXOipSRY1GeAPZf99yderwDN9pZK2C4ZokbktEjItfvqGtDWGFW-hWjkO35t9g__"
            alt="Trademarkia logo"
          />
        </div>

        {/* Search Input Section */}
        <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-2 relative w-full">
          <div className="relative w-full md:w-auto">
            {/* Search Icon */}
            <img
              src={search.src}
              className="w-6 h-6 absolute top-3 left-3 md:left-3 md:top-1/2 md:transform md:-translate-y-1/2"
              alt="search icon"
            />
            <input
              type="text"
              name="input_query"
              placeholder="Search Trademark Here eg. Nike"
              value={filters.input_query}
              onChange={handleInputChange}
              className="pl-10 py-3 border  border-gray-300 rounded-lg w-full md:w-96 transition duration-300 ease-in-out focus:ring focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-8 py-3  bg-primary text-white rounded-lg hover:bg-blue-700 md:w-auto hover:scale-105 transform transition duration-300"
          >
            Search
          </button>
        </div>
      </div>

      <hr className="border-4 hpx w-full border-[#EAF1FF]" />

      <div className="grid grid-cols-12 gap-6 p-2">
        {/* Search Results Section */}
        <main className="col-span-9 bg-white p-3 rounded-md ">
          {loading ? (
            <div
              className="w-12 h-12 border-4 border-white rounded-full inline-block box-border animate-spin"
              style={{ borderBottomColor: "#4380EC" }}
            ></div>
          ) : (
            <div>
              <div className="md:flex lg:flex lg:justify-start   w-[150%]">
                <div className=" justify-end gap-6 p-1 items-center mb-6 lg:hidden">
                  <button
                    onClick={() => setIsFilterVisible((prev) => !prev)}
                    className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-md"
                  >
                    <img
                      src={filter_alt.src}
                      className="w-4 h-4"
                      alt="filter"
                    />
                    <span className="inline-block text-xs w-12">Filter</span>
                  </button>
                </div>
                <div>
                  <p className="mb-4 text-[#4B5563]  font-bold">
                    About {trademarks.length} Trademarks found for “
                    {filters.input_query}”
                  </p>
                </div>
                {/* Filter Button for Small Screens */}
              </div>
              <hr className="border-2 hpx w-full border-[#E7E6E6]" />
              <div></div>
              <div className="flex gap-4 items-center">
                <p className="mt-6 mb-6 text-[#4B5563]  font-bold">
                  Also try searching for
                </p>
                <div className="flex gap-4">
                  {generateSuggestions(filters.input_query).map(
                    (suggestion, index) => (
                      <button
                        key={index}
                        className="border-2 border-[#F97316] text-[#F97316] py-1 px-2 rounded-lg  bg-[#FFF8F1] hover:bg-[#FFE0B3]"
                        onClick={() => handleSearchSuggestion(suggestion)}
                      >
                        {suggestion}
                      </button>
                    )
                  )}
                </div>
              </div>

              {viewType === "grid" || isMobile ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {trademarks.map((trademark) => (
                    <div
                      key={trademark.id}
                      className="bg-white p-4 shadow rounded-md w-full sm:max-w-xs lg:w-full mx-auto lg:mx-0  hover:shadow-lg transition-transform transform hover:scale-105 duration-300"
                    >
                      <div className="flex justify-between items-center">
                        <img
                          src={imageNotAvailable.src}
                          className="w-16 h-16 object-contain"
                          alt="image not available"
                        />
                        <div className="flex flex-col text-right">
                          <span className="inline-flex text-md font-semibold rounded-full text-success">
                            {trademark.status.charAt(0).toUpperCase() +
                              trademark.status.slice(1)}
                          </span>
                          <span className="text-xs text-black font-bold">
                            <span className="text-xs text-gray-500 font-medium">
                              on
                            </span>{" "}
                            {trademark.date}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div>
                          <div className="text-sm text-black font-bold">
                            {trademark.mark_identification}
                          </div>
                          <div className="text-sm text-gray-500">
                            {trademark.owner}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <img
                            src={Refresh.src}
                            className="cursor-pointer w-4 h-4"
                            alt="refresh"
                          />
                          <span className="text-xs text-black font-bold">
                            {trademark.renewal_date}
                          </span>
                        </div>
                      </div>

                      <div className="text-sm text-gray-500 mt-2">
                        {trademark.description.length > 50
                          ? trademark.description.slice(0, 50) + "..."
                          : trademark.description}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="hidden md:block">
                  <TrademarkList trademarks={trademarks} />
                </div>
              )}

              {/* // table component  */}
            </div>
          )}
        </main>
        {/* Filters Sidebar */}
        <aside
          className={`${
            isFilterVisible ? "block" : "hidden"
          } fixed top-0 overflow-y-auto right-0 w-full h-full lg: max-w-xs bg-white p-6 rounded-lg shadow-lg z-50 lg:block lg:static lg:w-auto lg:col-span-3 lg:mt-6 lg:p-6`}
        >
          {/* Close Button for Small Screens */}
          <div className="flex justify-between mb-6 lg:hidden">
            <span className="font-semibold text-lg">Filter</span>
            <button
              onClick={() => setIsFilterVisible(false)}
              className="text-gray-500 hover:text-gray-900"
            >
              ✖
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex justify-center gap-6 p-1 items-center mb-6">
            {/* <button
              // onClick={() => setIsFilterVisible((prev) => !prev)}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-md"
            >
              <img src={filter_alt.src} className="w-4 h-4" alt="filter" />
              <span className="inline-block text-xs">Filter</span>
            </button> */}
            <button
              className="px-2 py-2 border border-gray-300 bg-white rounded-full hover:scale-105 transform transition duration-300"
              onClick={handleShare}
            >
              <img src={share.src} className="w-6 h-6" alt="share" />
            </button>
            <button className="px-2 py-2 border border-gray-300 bg-white rounded-full hover:scale-105 transform transition duration-300">
              <img src={sort.src} className="w-6 h-6" alt="sort" />
            </button>
          </div>

          {/* Status Filter */}

          <div className="mb-6 bg-white p-6 shadow-lg rounded-md">
            <h3 className="text-lg font-bold mb-4">Status</h3>
            <div className="flex flex-wrap gap-2">
              {statuses.map((status) => (
                <button
                  key={status.value}
                  className={`flex items-center gap-1 hover:bg-blue-500 hover:text-white transition-colors duration-300 border border-1 border-[#D1D1D1] text-sm px-3 py-1 rounded-lg ${
                    selectedStatus === status.value
                      ? "bg-blue-500 text-white"
                      : "text-black"
                  }`}
                  onClick={() => handleStatusChange(status.value)}
                >
                  {status.label !== "All" ? (
                    <div
                      className={`w-2 h-2 rounded ${status.background}`}
                    ></div>
                  ) : null}
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Checkbox Filters Based on Active Tab */}

          <div className="mb-6 bg-white p-6 shadow-lg rounded-md">
            <div className="flex justify-between mb-6">
              <button
                onClick={() => handleTabChange("owners")}
                className={` rounded-md ${
                  activeTab === "owners"
                    ? "text-black font-bold underline"
                    : "bg-white text-gray-700"
                }`}
              >
                Owners
              </button>
              <button
                onClick={() => handleTabChange("lawFirms")}
                className={` rounded-md ${
                  activeTab === "lawFirms"
                    ? "text-black font-bold underline"
                    : "bg-white text-gray-700"
                }`}
              >
                Law Firms
              </button>
              <button
                onClick={() => handleTabChange("attorneys")}
                className={`rounded-md ${
                  activeTab === "attorneys"
                    ? "text-black font-bold underline"
                    : "bg-white text-gray-700"
                }`}
              >
                Attorneys
              </button>
            </div>
            <div className="relative">
              <img
                src={search.src}
                className="w-6 h-6 absolute top-3 left-3 md:left-2 md:top-1/3 md:transform md:-translate-y-1/3"
                alt="search icon"
              />
              <input
                type="text"
                placeholder={`Search ${
                  activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                }`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-8 py-3 border border-gray-300 text-black placeholder-black rounded-md mb-4"
              />
            </div>
            <div className="space-y-2">
              {activeTab === "owners" &&
                owners
                  .filter((own) =>
                    own.owner.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((own) => (
                    <div key={own.owner} className="flex items-center">
                      <input
                        type="checkbox"
                        id={own.owner}
                        name="owner"
                        value={own.owner}
                        className="mr-2 text-primary hover:text-primary w-5 h-5 rounded-lg"
                        checked={selectedOwners.includes(own.owner)}
                        onChange={() => handleOwnerChange(own.owner)}
                      />
                      <label
                        htmlFor={own.owner}
                        className={`text-md  ${
                          selectedOwners.includes(own.owner)
                            ? "text-primary"
                            : "text-black"
                        }`}
                      >
                        {own.owner}
                      </label>
                    </div>
                  ))}

              {activeTab === "lawFirms" &&
                lawFirms
                  .filter((firm) =>
                    firm.lawFirms
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )
                  .map((firm) => (
                    <div key={firm.lawFirms} className="flex items-center">
                      <input
                        type="checkbox"
                        id={firm.lawFirms}
                        name="lawFirm"
                        value={firm.lawFirms}
                        className="mr-2"
                        checked={selectedLawFirms.includes(firm.lawFirms)}
                        onChange={() => handleLawFirmChange(firm.lawFirms)}
                      />
                      <label htmlFor={firm.lawFirms} className="text-sm">
                        {firm.lawFirms}
                      </label>
                    </div>
                  ))}

              {activeTab === "attorneys" &&
                attorneys
                  .filter((at) =>
                    at.attorneys
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  )
                  .map((at) => (
                    <div key={at.attorneys} className="flex items-center">
                      <input
                        type="checkbox"
                        id={at.attorneys}
                        name="attorney"
                        value={at.attorneys}
                        className="mr-2"
                        checked={selectedAttorneys.includes(at.attorneys)}
                        onChange={() => handleAttorneyChange(at.attorneys)}
                      />
                      <label htmlFor={at.attorneys} className="text-sm">
                        {at.attorneys}
                      </label>
                    </div>
                  ))}
            </div>
          </div>

          {/* Display Options */}
          {!isFilterVisible ? (
            <div className="bg-white p-6 shadow-lg rounded-md">
              <h3 className="text-lg font-bold mb-4">Display</h3>
              <div className="flex space-x-2 p-2 rounded-lg bg-[#F1F1F1]">
                <button
                  className={` px-4 py-2 font-medium hover:scale-105 transform transition duration-300 rounded-md ${
                    viewType === "grid" ? "bg-white text-black" : ""
                  }`}
                  onClick={() => handleViewChange("grid")}
                >
                  Grid View
                </button>
                <button
                  className={`font-medium hover:scale-105 transform transition duration-300 px-4 py-2 rounded-md ${
                    viewType === "list" ? "bg-white text-black" : ""
                  }`}
                  onClick={() => handleViewChange("list")}
                >
                  List View
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 shadow-lg rounded-md">
              <h3 className="text-lg font-bold mb-4">Display</h3>
              <div className="flex space-x-2 p-2 rounded-lg bg-[#F1F1F1]">
                <button
                  className={` px-4 py-2 font-medium hover:scale-105 transform transition duration-300 rounded-md ${
                    viewType === "grid" ? "bg-white text-black" : ""
                  }`}
                  onClick={() => handleViewChange("grid")}
                >
                  Grid View
                </button>
                <button
                  className={`font-medium hover:scale-105 transform transition duration-300 px-4 py-2 rounded-md ${
                    viewType === "list" ? "bg-white text-black" : ""
                  }`}
                >
                  List View
                </button>
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
