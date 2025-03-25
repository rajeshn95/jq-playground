"use client";

import type React from "react";

import { Geist, Geist_Mono } from "next/font/google";
import { useState, useEffect, useRef } from "react";
import Head from "next/head";
import CodeEditor from "@uiw/react-textarea-code-editor";
import {
  ArrowRight,
  Moon,
  Sun,
  Download,
  Copy,
  Trash2,
  Bookmark,
  BookmarkCheck,
  Cpu,
  Layers,
  Zap,
  Info,
  Check,
  AlertCircle,
  Maximize2,
  Minimize2,
  RotateCcw,
  Settings,
  Shuffle,
  Code2,
  FileJson,
  Wand2,
} from "lucide-react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Sample JSON data examples
const sampleJsonExamples = [
  {
    name: "Person",
    data: `{
  "name": "Alice",
  "age": 25,
  "languages": ["English", "Spanish"],
  "address": {
    "city": "Wonderland",
    "zip": 12345
  }
}`,
  },
  {
    name: "Users List",
    data: `{
  "users": [
    { "name": "Alice", "age": 25 },
    { "name": "Bob", "age": 30 },
    { "name": "Charlie", "age": 22 }
  ],
  "active": true
}`,
  },
  {
    name: "Product Catalog",
    data: `{
  "products": [
    { 
      "id": "p1", 
      "name": "Laptop", 
      "price": 999.99,
      "tags": ["electronics", "computers"]
    },
    { 
      "id": "p2", 
      "name": "Headphones", 
      "price": 149.99,
      "tags": ["electronics", "audio"]
    }
  ],
  "currency": "USD"
}`,
  },
  {
    name: "Nested Data",
    data: `{
  "company": {
    "name": "TechCorp",
    "founded": 2010,
    "departments": [
      {
        "name": "Engineering",
        "employees": [
          {"id": 1, "name": "Jane", "skills": ["JavaScript", "React"]},
          {"id": 2, "name": "Mike", "skills": ["Python", "Django"]}
        ]
      },
      {
        "name": "Marketing",
        "employees": [
          {"id": 3, "name": "Sarah", "skills": ["SEO", "Content"]}
        ]
      }
    ]
  }
}`,
  },
];

// Sample queries
const sampleQueries = [
  { name: "Get property", query: ".name" },
  { name: "Filter array", query: ".users[] | select(.age > 25)" },
  {
    name: "Transform object",
    query: "{ user_count: (.users | length), names: [.users[].name] }",
  },
  { name: "Access nested", query: ".company.departments[0].employees[].name" },
  {
    name: "Map values",
    query: ".products[] | { id, name, sale_price: (.price * 0.9) }",
  },
  {
    name: "Complex filter",
    query:
      '.products[] | select(.price < 200 and (.tags | contains(["electronics"])))',
  },
];

export default function Home() {
  const [jsonData, setJsonData] = useState("");
  const [jqQuery, setJqQuery] = useState("");
  const [outputData, setOutputData] = useState("");
  const [error, setError] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [favorites, setFavorites] = useState<{ query: string; data: string }[]>(
    []
  );
  const [showSamples, setShowSamples] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: string;
  } | null>(null);
  const [fullscreenMode, setFullscreenMode] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [editorFontSize, setEditorFontSize] = useState(14);
  const [autoFormat, setAutoFormat] = useState(true);
  const [randomSample, setRandomSample] = useState<{
    data: string;
    query: string;
  } | null>(null);

  const jsonEditorRef = useRef<HTMLDivElement>(null);
  const queryEditorRef = useRef<HTMLDivElement>(null);
  const outputEditorRef = useRef<HTMLDivElement>(null);

  // Initialize dark mode based on system preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isDarkMode = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setDarkMode(isDarkMode);

      // Load favorites from localStorage
      const saved = localStorage.getItem("jq-favorites");
      if (saved) {
        try {
          setFavorites(JSON.parse(saved));
        } catch (e) {
          console.error("Failed to load favorites", e);
        }
      }
    }
  }, []);

  // Save favorites to localStorage when they change
  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem("jq-favorites", JSON.stringify(favorites));
    }
  }, [favorites]);

  // Generate a random sample when requested
  useEffect(() => {
    if (randomSample) {
      setJsonData(randomSample.data);
      setJqQuery(randomSample.query);
      setRandomSample(null);
    }
  }, [randomSample]);

  // Show notification
  const showNotification = (message: string, type: string) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // Validate JSON as user types
  const handleJsonChange = (value: string) => {
    setJsonData(value);
    try {
      if (value.trim()) {
        JSON.parse(value);
        setJsonError("");
      } else {
        setJsonError("");
      }
    } catch (err) {
      setJsonError("Invalid JSON format");
    }
  };

  const handleSubmit = async () => {
    // Clear previous errors and output
    setError("");

    // Validate JSON
    if (!jsonData.trim()) {
      setError("Please enter JSON data");
      return;
    }

    if (jsonError) {
      setError("Please fix the JSON format errors before running the query");
      return;
    }

    if (!jqQuery.trim()) {
      setError("Please enter a jq query");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await fetch("/api/jq-query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: jqQuery, data: jsonData }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setOutputData(JSON.stringify(result, null, 2));
      showNotification("Query executed successfully!", "success");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while processing your query"
      );
      setOutputData("");
      showNotification("Query execution failed", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = (example: (typeof sampleJsonExamples)[0]) => {
    setJsonData(example.data);
    setOutputData("");
    setError("");
    setJsonError("");
    setShowSamples(false);
    showNotification(`Loaded sample: ${example.name}`, "info");
  };

  const handleLoadQuery = (query: (typeof sampleQueries)[0]) => {
    setJqQuery(query.query);
    setError("");
    setShowSamples(false);
    showNotification(`Loaded query: ${query.name}`, "info");
  };

  const handleCopyOutput = () => {
    if (!outputData) return;
    navigator.clipboard.writeText(outputData);
    showNotification("Output copied to clipboard!", "success");
  };

  const handleDownloadOutput = () => {
    if (!outputData) return;
    const blob = new Blob([outputData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "jq-output.json";
    link.click();
    URL.revokeObjectURL(url);
    showNotification("Output downloaded as JSON file", "success");
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const clearAll = () => {
    setJsonData("");
    setJqQuery("");
    setOutputData("");
    setError("");
    setJsonError("");
    showNotification("All fields cleared", "info");
  };

  const formatJson = () => {
    try {
      if (jsonData.trim()) {
        const formatted = JSON.stringify(JSON.parse(jsonData), null, 2);
        setJsonData(formatted);
        setJsonError("");
        showNotification("JSON formatted successfully", "success");
      }
    } catch (err) {
      setJsonError("Invalid JSON format");
      showNotification("Cannot format invalid JSON", "error");
    }
  };

  const addToFavorites = () => {
    if (!jsonData.trim() || !jqQuery.trim()) {
      showNotification("Please enter both JSON data and a query", "error");
      return;
    }

    const newFavorite = {
      query: jqQuery,
      data: jsonData,
    };

    // Check if already exists
    const exists = favorites.some(
      (fav) => fav.query === jqQuery && fav.data === jsonData
    );

    if (exists) {
      showNotification("This query is already in your favorites", "info");
      return;
    }

    setFavorites([...favorites, newFavorite]);
    showNotification("Added to favorites!", "success");
  };

  const loadFavorite = (index: number) => {
    const favorite = favorites[index];
    setJqQuery(favorite.query);
    setJsonData(favorite.data);
    setOutputData("");
    setError("");
    setJsonError("");
    setShowFavorites(false);
    showNotification("Loaded from favorites", "info");
  };

  const removeFavorite = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const newFavorites = [...favorites];
    newFavorites.splice(index, 1);
    setFavorites(newFavorites);
    showNotification("Removed from favorites", "info");
  };

  const toggleFullscreen = (section: string) => {
    if (fullscreenMode === section) {
      setFullscreenMode(null);
    } else {
      setFullscreenMode(section);
    }
  };

  const generateRandomSample = () => {
    const randomJsonIndex = Math.floor(
      Math.random() * sampleJsonExamples.length
    );
    const randomQueryIndex = Math.floor(Math.random() * sampleQueries.length);

    setRandomSample({
      data: sampleJsonExamples[randomJsonIndex].data,
      query: sampleQueries[randomQueryIndex].query,
    });

    showNotification("Generated random sample", "info");
  };

  return (
    <div
      className={`${geistSans.variable} ${
        geistMono.variable
      } min-h-screen transition-colors duration-300 ${darkMode ? "dark" : ""}`}
    >
      <div className="min-h-screen bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
        <Head>
          <title>JSON Query Playground | Interactive jq Playground</title>
          <meta
            name="description"
            content="Transform and query JSON data with jq in an interactive playground."
          />
          <link rel="icon" href="/favicon.ico" />
        </Head>

        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 transition-opacity duration-300 ${
              notification.type === "success"
                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-800/30 dark:text-emerald-200"
                : notification.type === "error"
                ? "bg-rose-100 text-rose-800 dark:bg-rose-800/30 dark:text-rose-200"
                : "bg-sky-100 text-sky-800 dark:bg-sky-800/30 dark:text-sky-200"
            }`}
          >
            {notification.type === "success" ? (
              <Check className="w-5 h-5" />
            ) : notification.type === "error" ? (
              <AlertCircle className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            onClick={() => setShowSettings(false)}
          >
            <div
              className="bg-white dark:bg-slate-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                  Settings
                </h3>
                <button
                  onClick={() => setShowSettings(false)}
                  className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Editor Font Size
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="range"
                      min="12"
                      max="20"
                      value={editorFontSize}
                      onChange={(e) =>
                        setEditorFontSize(Number.parseInt(e.target.value))
                      }
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700"
                    />
                    <span className="text-slate-700 dark:text-slate-300 w-8 text-center">
                      {editorFontSize}px
                    </span>
                  </div>
                </div>

                {/* <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Auto-format JSON
                  </label>
                  <div
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
                      autoFormat
                        ? "bg-emerald-500 justify-end"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}
                    onClick={() => setAutoFormat(!autoFormat)}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                  </div>
                </div> */}

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Dark Mode
                  </label>
                  <div
                    className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer ${
                      darkMode
                        ? "bg-emerald-500 justify-end"
                        : "bg-slate-300 dark:bg-slate-700"
                    }`}
                    onClick={toggleDarkMode}
                  >
                    <div className="bg-white w-4 h-4 rounded-full shadow-md"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Layout */}
        <div className="min-h-screen flex flex-col">
          {/* Header */}
          <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="max-w-screen-2xl mx-auto px-4 py-3 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-cyan-500 to-blue-600 text-white p-2 rounded-lg">
                  <FileJson className="w-6 h-6" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-800 dark:text-white">
                    JSON Query Playground
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Powered by jq-wasm
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={generateRandomSample}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Shuffle className="w-4 h-4" />
                  <span className="hidden sm:inline">Random Example</span>
                </button>

                <button
                  onClick={() => setShowSettings(true)}
                  className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  <Settings className="w-5 h-5" />
                </button>

                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors"
                >
                  {darkMode ? (
                    <Sun className="w-5 h-5" />
                  ) : (
                    <Moon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 md:p-6 max-w-screen-2xl mx-auto w-full">
            {/* Workflow Container */}
            <div
              className={`grid gap-4 ${
                fullscreenMode ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-3"
              }`}
            >
              {/* JSON Input */}
              {(!fullscreenMode || fullscreenMode === "json") && (
                <div
                  className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${
                    fullscreenMode === "json" ? "col-span-1" : "col-span-1"
                  }`}
                >
                  <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <Layers className="w-4 h-4" />
                      </div>
                      <h2 className="font-medium text-slate-700 dark:text-slate-200">
                        JSON Input
                      </h2>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setShowSamples(!showSamples)}
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Code2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={formatJson}
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Wand2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleFullscreen("json")}
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        {fullscreenMode === "json" ? (
                          <Minimize2 className="w-4 h-4" />
                        ) : (
                          <Maximize2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sample Dropdown */}
                  {showSamples && (
                    <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-2">
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 px-2">
                        Sample Data
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {sampleJsonExamples.map((example, index) => (
                          <button
                            key={index}
                            onClick={() => handleLoadSample(example)}
                            className="text-left px-2 py-1 text-xs rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            {example.name}
                          </button>
                        ))}
                      </div>
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 mb-1 px-2">
                        Sample Queries
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {sampleQueries.map((query, index) => (
                          <button
                            key={index}
                            onClick={() => handleLoadQuery(query)}
                            className="text-left px-2 py-1 text-xs rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            {query.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="relative h-full" ref={jsonEditorRef}>
                    <CodeEditor
                      value={jsonData}
                      language="json"
                      placeholder="Enter your JSON data here..."
                      onChange={(e) => handleJsonChange(e.target.value)}
                      padding={16}
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        fontSize: editorFontSize,
                        backgroundColor: darkMode ? "#0f172a" : "#ffffff",
                        color: darkMode ? "#e2e8f0" : "#0f172a",
                        minHeight: fullscreenMode
                          ? "calc(100vh - 180px)"
                          : "300px",
                      }}
                      className="h-full"
                    />
                    {jsonError && (
                      <div className="absolute bottom-3 left-3 right-3 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs p-2 rounded-md">
                        {jsonError}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Query Editor */}
              {(!fullscreenMode || fullscreenMode === "query") && (
                <div
                  className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${
                    fullscreenMode === "query" ? "col-span-1" : "col-span-1"
                  }`}
                >
                  <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                        <Cpu className="w-4 h-4" />
                      </div>
                      <h2 className="font-medium text-slate-700 dark:text-slate-200">
                        jq Query
                      </h2>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setShowFavorites(!showFavorites)}
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                      <button
                        onClick={addToFavorites}
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        <BookmarkCheck className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleFullscreen("query")}
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        {fullscreenMode === "query" ? (
                          <Minimize2 className="w-4 h-4" />
                        ) : (
                          <Maximize2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Favorites Dropdown */}
                  {showFavorites && (
                    <div className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-2">
                      <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 px-2">
                        Saved Favorites
                      </div>
                      {favorites.length === 0 ? (
                        <div className="px-2 py-3 text-center text-xs text-slate-500 dark:text-slate-400">
                          No favorites saved yet. Use the bookmark icon to save
                          queries.
                        </div>
                      ) : (
                        <div className="max-h-40 overflow-y-auto">
                          {favorites.map((favorite, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between px-2 py-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded"
                            >
                              <button
                                onClick={() => loadFavorite(index)}
                                className="text-left text-xs text-slate-700 dark:text-slate-300 truncate flex-1"
                              >
                                {favorite.query}
                              </button>
                              <button
                                onClick={(e) => removeFavorite(index, e)}
                                className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div ref={queryEditorRef}>
                    <CodeEditor
                      value={jqQuery}
                      language="bash"
                      placeholder="Enter your jq query here... (e.g., .name or .users[] | select(.age > 25))"
                      onChange={(e) => setJqQuery(e.target.value)}
                      padding={16}
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        fontSize: editorFontSize,
                        backgroundColor: darkMode ? "#0f172a" : "#ffffff",
                        color: darkMode ? "#e2e8f0" : "#0f172a",
                        minHeight: fullscreenMode
                          ? "calc(100vh - 180px)"
                          : "150px",
                      }}
                    />
                  </div>

                  <div className="p-3 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={clearAll}
                        className="text-xs px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={isProcessing || Boolean(jsonError)}
                      className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-white transition-colors ${
                        isProcessing || Boolean(jsonError)
                          ? "bg-slate-400 dark:bg-slate-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" />
                          <span>Run Query</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Output */}
              {(!fullscreenMode || fullscreenMode === "output") && (
                <div
                  className={`bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden ${
                    fullscreenMode === "output" ? "col-span-1" : "col-span-1"
                  }`}
                >
                  <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-md bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                      <h2 className="font-medium text-slate-700 dark:text-slate-200">
                        Result
                      </h2>
                    </div>

                    <div className="flex items-center gap-1">
                      {outputData && (
                        <>
                          <button
                            onClick={handleCopyOutput}
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={handleDownloadOutput}
                            className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => toggleFullscreen("output")}
                        className="p-1.5 rounded-md text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                      >
                        {fullscreenMode === "output" ? (
                          <Minimize2 className="w-4 h-4" />
                        ) : (
                          <Maximize2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-300 text-sm flex items-start">
                      <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div ref={outputEditorRef}>
                    <CodeEditor
                      value={outputData}
                      language="json"
                      readOnly
                      placeholder={
                        isProcessing
                          ? "Processing..."
                          : "Result will appear here..."
                      }
                      padding={16}
                      style={{
                        fontFamily: "var(--font-geist-mono)",
                        fontSize: editorFontSize,
                        backgroundColor: darkMode ? "#0f172a" : "#ffffff",
                        color: darkMode ? "#e2e8f0" : "#0f172a",
                        minHeight: fullscreenMode
                          ? "calc(100vh - 180px)"
                          : "300px",
                      }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Help Section */}
            <div className="mt-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
              <div className="p-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-400">
                    <Info className="w-4 h-4" />
                  </div>
                  <h2 className="font-medium text-slate-700 dark:text-slate-200">
                    jq Quick Reference
                  </h2>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Basic Syntax
                    </h3>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <li className="flex items-start gap-2">
                        <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-cyan-700 dark:text-cyan-400">
                          .
                        </code>
                        <span>The current object (identity)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-cyan-700 dark:text-cyan-400">
                          .property
                        </code>
                        <span>Access a property value</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-cyan-700 dark:text-cyan-400">
                          .[]
                        </code>
                        <span>Iterate over array elements</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-cyan-700 dark:text-cyan-400">
                          .[0]
                        </code>
                        <span>Access array element by index</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Filters
                    </h3>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <li className="flex items-start gap-2">
                        <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-cyan-700 dark:text-cyan-400">
                          |
                        </code>
                        <span>Pipe output to next filter</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-cyan-700 dark:text-cyan-400">
                          select(condition)
                        </code>
                        <span>Filter objects based on condition</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-cyan-700 dark:text-cyan-400">
                          map(expression)
                        </code>
                        <span>Transform each element of an array</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-cyan-700 dark:text-cyan-400">
                          length
                        </code>
                        <span>Get the length of an array or string</span>
                      </li>
                    </ul>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Advanced
                    </h3>
                    <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <li className="flex items-start gap-2">
                        <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-cyan-700 dark:text-cyan-400">
                          {"{field: value}"}
                        </code>
                        <span>Create a new object</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-cyan-700 dark:text-cyan-400">
                          if-then-else
                        </code>
                        <span>Conditional logic</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-cyan-700 dark:text-cyan-400">
                          add
                        </code>
                        <span>Sum array elements</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <code className="bg-slate-200 dark:bg-slate-700 px-1 rounded text-cyan-700 dark:text-cyan-400">
                          keys
                        </code>
                        <span>Get object keys as an array</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </main>

          {/* Footer */}
          <footer className="mt-auto py-4 border-t border-slate-200 dark:border-slate-800">
            <div className="max-w-screen-2xl mx-auto px-4 text-center text-slate-500 dark:text-slate-400 text-xs">
              <p>
                JSON Query Playground &copy; {new Date().getFullYear()} |
                Powered by jq-wasm
              </p>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}
