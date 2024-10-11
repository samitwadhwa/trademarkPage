"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import imageNotAvailable from "@/assets/images/ImageNotAvailable.png";
import filter_alt from "@/assets/images/filter_alt.png";
import sort from "@/assets/images/sort.png";
import share from "@/assets/images/share.png";
import Refresh from "@/assets/images/Refresh.png";
import search from "@/assets/images/searchIcon.png";

interface Trademark {
  id: number;
  mark_identification: string;
  status: string;
  owner: string;
  description: string;
  date: string;
  renewal_date: string;
}

interface Owner {
  owner: string;
}

export default function Home() {
  const [trademarks, setTrademarks] = useState<Trademark[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [lawFirms, setLawFirms] = useState<string[]>([]); // State for law firms
  const [attorneys, setAttorneys] = useState<string[]>([]); // State for attorneys
  const [selectedOwners, setSelectedOwners] = useState<string[]>([]);
  const [selectedLawFirms, setSelectedLawFirms] = useState<string[]>([]); // State for selected law firms
  const [selectedAttorneys, setSelectedAttorneys] = useState<string[]>([]); // State for selected attorneys
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null); // State for selected status
  const [activeTab, setActiveTab] = useState<"owners" | "lawFirms" | "attorneys">("owners"); // Active tab state
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    input_query: "",
    input_query_type: "",
    status: [],
    owners: "",
    sort_order: "desc",
  });

  const handleInputChange = (e: any) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  function formatDate(dateString: number) {
    const date = new Date(dateString * 1000); // Converting timestamp (in seconds) to milliseconds
    const day = date.getDate();

    const daySuffix = (day: number) => {
      if (day > 3 && day < 21) return "th"; // Covers 11th - 20th
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
    try {
      const response = await axios.post(
        "https://vit-tm-task.api.trademarkia.app/api/v3/us",
        {
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
        }
      );

      // Extract the required data
      const hits = response.data.body.hits.hits;

      const nameOwner = Array.from(
        new Set(hits.map((hit: any) => hit._source.search_bar.owner))
      ).map((owner) => ({ owner: owner as string })); // Type assertion here


      // Here, you would extract and set law firms and attorneys in a similar way
      const nameLawFirms = Array.from(new Set(hits.map((hit: any) => hit._source.law_firm)))
        .filter((firm) => firm) // Filter out undefined/null
        .map(firm => firm as string);

      const nameAttorneys = Array.from(new Set(hits.map((hit: any) => hit._source.attorney)))
        .filter((attorney) => attorney) // Filter out undefined/null
        .map(attorney => attorney as string);

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
      if (prevSelectedOwners.includes(owner)) {
        return prevSelectedOwners.filter(
          (selectedOwner) => selectedOwner !== owner
        );
      } else {
        return [...prevSelectedOwners, owner];
      }
    });
  };

  const handleLawFirmChange = (firm: string) => {
    setSelectedLawFirms((prevSelectedLawFirms) => {
      if (prevSelectedLawFirms.includes(firm)) {
        return prevSelectedLawFirms.filter((selectedFirm) => selectedFirm !== firm);
      } else {
        return [...prevSelectedLawFirms, firm];
      }
    });
  };

  const handleAttorneyChange = (attorney: string) => {
    setSelectedAttorneys((prevSelectedAttorneys) => {
      if (prevSelectedAttorneys.includes(attorney)) {
        return prevSelectedAttorneys.filter((selectedAttorney) => selectedAttorney !== attorney);
      } else {
        return [...prevSelectedAttorneys, attorney];
      }
    });
  };

  const handleStatusChange = (status: string) => {
    if (selectedStatus === status) {
      setSelectedStatus(null); // If the same status is clicked again, deselect it
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
    if (selectedOwners.length > 0 || selectedStatus || selectedLawFirms.length > 0 || selectedAttorneys.length > 0) {
      const filteredTrademarks = trademarks.filter((trademark) => {
        const ownerMatch = selectedOwners.length === 0 || selectedOwners.includes(trademark.owner);
        const statusMatch = selectedStatus ? trademark.status === selectedStatus : true;

        // Filter by selected law firms and attorneys based on active tab
        const lawFirmMatch = activeTab === "lawFirms" ? selectedLawFirms.length === 0 || selectedLawFirms.includes(trademark.owner) : true;
        const attorneyMatch = activeTab === "attorneys" ? selectedAttorneys.length === 0 || selectedAttorneys.includes(trademark.owner) : true;

        return ownerMatch && statusMatch && (activeTab === "owners" ? true : lawFirmMatch || attorneyMatch);
      });
      setTrademarks(filteredTrademarks);
    } else {
      handleSearch(); // Re-fetch if no filters are selected
    }
  }, [selectedOwners, selectedStatus, selectedLawFirms, selectedAttorneys, activeTab]);

  return (
    <div className="container mx-auto bg-white font-myCustomFont">
      {/* Search Section */}
      <div className="flex justify-start gap-8 p-8 items-center bg-lightening">
        <div className="p-2">
          <img height={200} width={200} src="https://s3-alpha-sig.figma.com/img/29e3/a292/59a6875d50b71e2c1320ab20e9a4c855?Expires=1729468800&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=WAoNr9xVG4h-TXEoC0tRFTZsTMW3L32Q2o-Jao1jDFHJ74Fap9NyqYRYL-OzOAZfUn-1oD5YKVX5gqcha~DOloBCXO4fwrNXynhfgHNJb8rzvP1pW9~JdgDxqQAa~e4HRXcGb6KhP2dLu4~NYsHVmlkMbhZLtr3yQGWeGFze-zHqAofth35x3RoOtAPyAWp13fd~lG-QH~k7UO2u1rdlW33X94HJlJo5cY1ibBzYjCIUu09W72KauNIJdic0-Cg5WmVFouEUASgsJbeiha6X-Vi4ZXOipSRY1GeAPZf99yderwDN9pZK2C4ZokbktEjItfvqGtDWGFW-hWjkO35t9g__" alt="Trademarkia logo" />
        </div>
        <div className="flex items-center space-x-4 relative">
          <img
            src={search.src}
            className="w-6 h-6 absolute left-7"
            alt="search icon"
          />
          <input
            type="text"
            name="input_query"
            placeholder="Search Trademark Here eg. Nike"
            value={filters.input_query}
            onChange={handleInputChange}
            className="px-10 py-3 border text-start font-myCustomFont border-gray-300 rounded-lg w-full md:w-96"
          />
          <button
            onClick={handleSearch}
            className="px-8 py-3 font-myCustomFont bg-primary text-white rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </div>
      </div>
      <hr className="border-4 hpx w-full border-[#EAF1FF]" />

      <div className="grid grid-cols-12 gap-6 p-8">
        {/* Search Results Section */}
        <main className="col-span-9 bg-white p-6 rounded-md">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div>
              <p className="mb-4 text-[#4B5563] font-myCustomFont font-bold">
                About {trademarks.length} Trademarks found for “
                {filters.input_query}”
              </p>
              <hr className="border-2 hpx w-full border-[#E7E6E6]" />

              <div className="flex gap-4 items-center">
                <p className="mt-6 mb-6 text-[#4B5563] font-myCustomFont font-bold">
                  Also try searching for
                </p>
                <div className="flex gap-4">
                  {generateSuggestions(filters.input_query).map(
                    (suggestion, index) => (
                      <button
                        key={index}
                        className="border-2 border-[#F97316] text-[#F97316] py-2 px-4 rounded-full font-myCustomFont bg-[#FFF8F1] hover:bg-[#FFE0B3]"
                        onClick={() => handleSearchSuggestion(suggestion)}
                      >
                        {suggestion}
                      </button>
                    )
                  )}
                </div>
              </div>

              {trademarks.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 font-myCustomFont">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-md font-medium text-black">
                          Mark
                        </th>
                        <th className="px-6 py-3 text-left text-md font-medium text-black">
                          Details
                        </th>
                        <th className="px-6 py-3 text-left text-md font-medium text-black">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-md font-medium text-black">
                          Class/Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200 font-myCustomFont">
                      {trademarks.map((trademark) => (
                        <tr key={trademark.id}>
                          <td className="px-2 py-4 whitespace-nowrap">
                            <img
                              src={imageNotAvailable.src}
                              className="w-16 h-16"
                              alt="image not available"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-black font-bold">
                              {trademark.mark_identification}
                            </div>
                            <div className="text-sm text-gray-500">
                              {trademark.owner}
                            </div>
                            <div className="text-sm text-black font-bold mt-4">
                              {trademark.id}
                            </div>
                            <div className="text-sm text-gray-500">
                              {trademark.date}
                            </div>
                          </td>
                          <td className="flex flex-col items-start px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex text-md font-semibold rounded-full text-success">
                              {trademark.status.charAt(0).toUpperCase() +
                                trademark.status.slice(1)}
                            </span>
                            <span className="text-xs text-black font-bold">
                              <span className="text-xs text-grey-500 font-medium">
                                on
                              </span>{" "}
                              {trademark.date}
                            </span>
                            <div className="flex items-center gap-1 mt-8">
                              <img
                                src={Refresh.src}
                                className="w-4 h-4"
                                alt="refresh"
                              />
                              <span className="text-xs text-black font-bold">
                                {trademark.renewal_date}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {trademark.description}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="font-myCustomFont">No results found</p>
              )}
            </div>
          )}
        </main>
        {/* Filters Sidebar */}
        <aside className="col-span-3 p-6 rounded-lg font-myCustomFont mt-10">
          <div className="flex justify-center gap-6 p-1 items-center mb-6">
            <button className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-md">
              <img src={filter_alt.src} className="w-4 h-4" alt="filter" />
              <span className="inline-block text-xs">Filter</span>
            </button>
            <button className="px-2 py-2 border border-gray-300 bg-white rounded-full">
              <img src={share.src} className="w-4 h-4" alt="share" />
            </button>
            <button className="px-2 py-2 border border-gray-300 bg-white rounded-full">
              <img src={sort.src} className="w-4 h-4" alt="sort" />
            </button>
          </div>

          {/* Status Filter */}
          <div className="mb-6 bg-white p-6 shadow-lg rounded-md">
            <h3 className="text-sm font-medium mb-4">Status</h3>
            <div className="flex flex-wrap gap-2">
              <button className="border border-1 border-[#D1D1D1] text-sm px-3 py-1 rounded-full">
                All
              </button>
              <button className="flex items-center gap-1 border border-1 border-[#D1D1D1] text-black text-sm px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-success"></div>{" "}
                Registered
              </button>
              <button className="flex items-center gap-1 border border-1 border-[#D1D1D1] text-black text-sm px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-warning"></div> Pending
              </button>
              <button className="flex items-center gap-1 border border-1 border-[#D1D1D1] text-black text-sm px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-danger"></div> Abandoned
              </button>
              <button className="flex items-center gap-1 border border-1 border-[#D1D1D1] text-black text-sm px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-primary"></div> Others
              </button>
            </div>
          </div>

          {/* Owners Filter */}
          <div className="flex justify-between mb-6">
            <button
              onClick={() => handleTabChange("owners")}
              className={`font-myCustomFont py-2 px-4 rounded-md ${activeTab === "owners" ? "bg-blue-500 text-white" : "bg-white text-black"}`}
            >
              Owners
            </button>
            <button
              onClick={() => handleTabChange("lawFirms")}
              className={`font-myCustomFont py-2 px-4 rounded-md ${activeTab === "lawFirms" ? "bg-blue-500 text-white" : "bg-white text-black"}`}
            >
              Law Firms
            </button>
            <button
              onClick={() => handleTabChange("attorneys")}
              className={`font-myCustomFont py-2 px-4 rounded-md ${activeTab === "attorneys" ? "bg-blue-500 text-white" : "bg-white text-black"}`}
            >
              Attorneys
            </button>
          </div>

          {/* Dynamic Checkbox Filters Based on Active Tab */}
          <div className="mb-6 bg-white p-6 shadow-lg rounded-md">
            <h3 className="text-sm font-medium mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h3>
            <input
              type="text"
              placeholder={`Search ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}`}
              className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
            />
            <div className="space-y-2">
              {activeTab === "owners" && owners.map((own) => (
                <div key={own.owner} className="flex items-center">
                  <input
                    type="checkbox"
                    id={own.owner}
                    name="owner"
                    value={own.owner}
                    className="mr-2"
                    checked={selectedOwners.includes(own.owner)}
                    onChange={() => handleOwnerChange(own.owner)}
                  />
                  <label htmlFor={own.owner} className="text-sm">
                    {own.owner}
                  </label>
                </div>
              ))}

              {activeTab === "lawFirms" && lawFirms.map((firm) => (
                <div key={firm} className="flex items-center">
                  <input
                    type="checkbox"
                    id={firm}
                    name="lawFirm"
                    value={firm}
                    className="mr-2"
                    checked={selectedLawFirms.includes(firm)}
                    onChange={() => handleLawFirmChange(firm)}
                  />
                  <label htmlFor={firm} className="text-sm">
                    {firm}
                  </label>
                </div>
              ))}

              {activeTab === "attorneys" && attorneys.map((attorney) => (
                <div key={attorney} className="flex items-center">
                  <input
                    type="checkbox"
                    id={attorney}
                    name="attorney"
                    value={attorney}
                    className="mr-2"
                    checked={selectedAttorneys.includes(attorney)}
                    onChange={() => handleAttorneyChange(attorney)}
                  />
                  <label htmlFor={attorney} className="text-sm">
                    {attorney}
                  </label>
                </div>
              ))}
            </div>
            </div>
        

          {/* Display Options */}
          <div className="bg-white p-6 shadow-lg rounded-md">
            <h3 className="text-sm font-medium mb-4">Display</h3>
            <div className="flex space-x-2">
              <button className="border border-gray-300 px-4 py-2 rounded-md">
                Grid View
              </button>
              <button className="border border-gray-300 px-4 py-2 rounded-md">
                List View
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
