import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Atmosphere from "@/components/layout/Atmosphere";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
import CodeEditor from "@/components/playground/CodeEditor";
import { useCodeSnippets } from "@/hooks/useCodeSnippets";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2, Play, RotateCcw, Share2, FolderOpen, Loader2, Save, Clock, Trash2, Edit3, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

// Programming languages configuration
const LANGUAGE_MODES = [
  { id: 'web', name: 'Web', icon: 'language', description: 'HTML + CSS + JS', executable: true, color: '#e44d26' },
  { id: 'python', name: 'Python', icon: 'code', description: 'Python 3', executable: true, color: '#3776ab' },
  { id: 'javascript', name: 'JavaScript', icon: 'javascript', description: 'Node.js', executable: true, color: '#f7df1e' },
  { id: 'typescript', name: 'TypeScript', icon: 'code', description: 'TypeScript', executable: true, color: '#3178c6' },
  { id: 'java', name: 'Java', icon: 'coffee', description: 'Java', executable: true, color: '#ed8b00' },
  { id: 'csharp', name: 'C#', icon: 'code', description: '.NET', executable: true, color: '#68217a' },
  { id: 'cpp', name: 'C++', icon: 'memory', description: 'C++', executable: true, color: '#00599c' },
  { id: 'go', name: 'Go', icon: 'code', description: 'Golang', executable: true, color: '#00add8' },
  { id: 'rust', name: 'Rust', icon: 'settings', description: 'Rust', executable: true, color: '#dea584' },
  { id: 'ruby', name: 'Ruby', icon: 'diamond', description: 'Ruby', executable: true, color: '#cc342d' },
  { id: 'php', name: 'PHP', icon: 'code', description: 'PHP 8', executable: true, color: '#777bb4' },
  { id: 'swift', name: 'Swift', icon: 'phone_iphone', description: 'Swift', executable: true, color: '#fa7343' },
  { id: 'kotlin', name: 'Kotlin', icon: 'android', description: 'Kotlin', executable: true, color: '#7f52ff' },
  { id: 'sql', name: 'SQL', icon: 'storage', description: 'SQLite', executable: true, color: '#336791' },
];

const DEFAULT_WEB_CODE = {
  html: `<!DOCTYPE html>
<html>
<head>
  <title>My Page</title>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>Welcome to the code playground!</p>
  <button onclick="greet()">Click Me</button>
</body>
</html>`,
  css: `body {
  font-family: 'Inter', sans-serif;
  background: #1a1a2e;
  color: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 20px;
}

h1 {
  color: #d4a853;
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

button {
  background: #d4a853;
  color: #1a1a2e;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

button:hover {
  transform: scale(1.05);
}`,
  javascript: `function greet() {
  alert('Hello from JavaScript!');
}

console.log('JavaScript is running!');

document.addEventListener('DOMContentLoaded', () => {
  console.log('Page loaded!');
});`
};

const DEFAULT_SNIPPETS: Record<string, string> = {
  python: `# Python Example
def greet(name):
    return f"Hello, {name}!"

message = greet("World")
print(message)

numbers = [1, 2, 3, 4, 5]
squares = [n**2 for n in numbers]
print(f"Squares: {squares}")`,

  javascript: `// JavaScript Example
const greet = (name) => \`Hello, \${name}!\`;

const numbers = [1, 2, 3, 4, 5];
const squares = numbers.map(n => n * n);

console.log(greet('World'));
console.log('Squares:', squares);`,

  typescript: `// TypeScript Example
interface User {
  id: number;
  name: string;
}

const greet = (user: User): string => \`Hello, \${user.name}!\`;

const user: User = { id: 1, name: "John" };
console.log(greet(user));`,

  java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        int[] numbers = {1, 2, 3, 4, 5};
        for (int n : numbers) {
            System.out.print(n * n + " ");
        }
    }
}`,

  csharp: `using System;
using System.Linq;

class Program {
    static void Main() {
        Console.WriteLine("Hello, World!");
        
        var numbers = new[] {1, 2, 3, 4, 5};
        var squares = numbers.Select(n => n * n);
        Console.WriteLine(string.Join(", ", squares));
    }
}`,

  cpp: `#include <iostream>
#include <vector>

int main() {
    std::cout << "Hello, World!" << std::endl;
    
    std::vector<int> nums = {1, 2, 3, 4, 5};
    for (int n : nums) {
        std::cout << n * n << " ";
    }
    std::cout << std::endl;
    return 0;
}`,

  go: `package main

import "fmt"

func main() {
    fmt.Println("Hello, World!")
    
    numbers := []int{1, 2, 3, 4, 5}
    for _, n := range numbers {
        fmt.Printf("%d ", n*n)
    }
    fmt.Println()
}`,

  rust: `fn main() {
    println!("Hello, World!");
    
    let numbers = vec![1, 2, 3, 4, 5];
    let squares: Vec<i32> = numbers.iter().map(|&n| n * n).collect();
    println!("Squares: {:?}", squares);
}`,

  ruby: `def greet(name)
  "Hello, #{name}!"
end

puts greet("World")

numbers = [1, 2, 3, 4, 5]
squares = numbers.map { |n| n**2 }
puts "Squares: #{squares}"`,

  php: `<?php
echo "Hello, World!\\n";

$numbers = [1, 2, 3, 4, 5];
$squares = array_map(fn($n) => $n**2, $numbers);
echo "Squares: " . implode(", ", $squares) . "\\n";
?>`,

  swift: `import Foundation

func greet(_ name: String) -> String {
    return "Hello, \\(name)!"
}

print(greet("World"))

let numbers = [1, 2, 3, 4, 5]
let squares = numbers.map { $0 * $0 }
print("Squares: \\(squares)")`,

  kotlin: `fun main() {
    println("Hello, World!")
    
    val numbers = listOf(1, 2, 3, 4, 5)
    val squares = numbers.map { it * it }
    println("Squares: $squares")
}`,

  sql: `CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE
);

INSERT INTO users VALUES (1, 'John', 'john@example.com');
INSERT INTO users VALUES (2, 'Jane', 'jane@example.com');

SELECT * FROM users;`,
};

interface SavedSnippet {
  id: string;
  title: string;
  language: string;
  updated_at: string;
  is_public: boolean;
}

const Playground = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const { isLoading, saveSnippet, getSnippet, updateSnippet } = useCodeSnippets();
  
  const [selectedLanguage, setSelectedLanguage] = useState('web');
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  
  const [htmlCode, setHtmlCode] = useState(DEFAULT_WEB_CODE.html);
  const [cssCode, setCssCode] = useState(DEFAULT_WEB_CODE.css);
  const [jsCode, setJsCode] = useState(DEFAULT_WEB_CODE.javascript);
  const [activeTab, setActiveTab] = useState<'html' | 'css' | 'javascript'>('html');
  
  const [singleCode, setSingleCode] = useState('');
  
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  const [snippetTitle, setSnippetTitle] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [hideCode, setHideCode] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [currentSnippetId, setCurrentSnippetId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Saved snippets
  const [savedSnippets, setSavedSnippets] = useState<SavedSnippet[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);

  // Code execution state
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [outputError, setOutputError] = useState('');
  const [executionTime, setExecutionTime] = useState<number | null>(null);

  useEffect(() => {
    const editId = searchParams.get('edit');
    const forkId = searchParams.get('fork');
    if (editId) {
      loadSnippetForEdit(editId);
    } else if (forkId) {
      loadSnippet(forkId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (selectedLanguage !== 'web' && !singleCode) {
      setSingleCode(DEFAULT_SNIPPETS[selectedLanguage] || '// Write your code here...');
    }
  }, [selectedLanguage]);

  // Track unsaved changes
  useEffect(() => {
    if (currentSnippetId) {
      setHasUnsavedChanges(true);
    }
  }, [htmlCode, cssCode, jsCode, singleCode]);

  // Ctrl+S keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleQuickSave();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentSnippetId, snippetTitle, htmlCode, cssCode, jsCode, singleCode, selectedLanguage]);

  const loadSnippetForEdit = async (id: string) => {
    const snippet = await getSnippet(id);
    if (snippet) {
      if (snippet.language === 'web') {
        setSelectedLanguage('web');
        setHtmlCode(snippet.html_code);
        setCssCode(snippet.css_code);
        setJsCode(snippet.js_code);
      } else {
        setSelectedLanguage(snippet.language);
        setSingleCode(snippet.js_code);
      }
      setSnippetTitle(snippet.title);
      setCurrentSnippetId(id);
      setHasUnsavedChanges(false);
      toast({ title: 'პროექტი ჩაიტვირთა!', description: 'შეგიძლია განაგრძო რედაქტირება.' });
    }
  };

  const loadSnippet = async (id: string) => {
    const snippet = await getSnippet(id);
    if (snippet) {
      if (snippet.language === 'web') {
        setSelectedLanguage('web');
        setHtmlCode(snippet.html_code);
        setCssCode(snippet.css_code);
        setJsCode(snippet.js_code);
      } else {
        setSelectedLanguage(snippet.language);
        setSingleCode(snippet.js_code);
      }
      setSnippetTitle(snippet.title + ' (Fork)');
      toast({ title: 'კოდი ჩაიტვირთა!', description: 'შეგიძლია შეცვალო და შეინახო ახალი ვერსია.' });
    }
  };

  const fetchSavedSnippets = async () => {
    if (!user) return;
    setLoadingSaved(true);
    try {
      const { data, error } = await supabase
        .from('code_snippets')
        .select('id, title, language, updated_at, is_public')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      setSavedSnippets((data as SavedSnippet[]) || []);
    } catch (error) {
      console.error('Error fetching saved snippets:', error);
    } finally {
      setLoadingSaved(false);
    }
  };

  const handleOpenSavedPanel = () => {
    if (!user) {
      toast({ title: 'ავტორიზაცია საჭიროა', description: 'შენახული პროექტების სანახავად გაიარეთ ავტორიზაცია.', variant: 'destructive' });
      return;
    }
    setShowSavedPanel(!showSavedPanel);
    if (!showSavedPanel) fetchSavedSnippets();
  };

  const handleLoadSnippet = async (id: string) => {
    await loadSnippetForEdit(id);
    setShowSavedPanel(false);
  };

  const handleDeleteSnippet = async (id: string) => {
    try {
      const { error } = await supabase.from('code_snippets').delete().eq('id', id);
      if (error) throw error;
      setSavedSnippets(prev => prev.filter(s => s.id !== id));
      if (currentSnippetId === id) {
        setCurrentSnippetId(null);
        setSnippetTitle('');
      }
      toast({ title: 'წაიშალა!', description: 'პროექტი წარმატებით წაიშალა.' });
    } catch {
      toast({ title: 'შეცდომა', description: 'წაშლა ვერ მოხერხდა.', variant: 'destructive' });
    }
  };

  const getPreviewContent = () => `
    <!DOCTYPE html><html><head><style>${cssCode}</style></head>
    <body>${htmlCode.replace(/<\/?html>|<\/?head>|<\/?body>|<!DOCTYPE html>/gi, '')}
    <script>${jsCode}<\/script></body></html>`;

  const handleReset = () => {
    if (selectedLanguage === 'web') {
      setHtmlCode(DEFAULT_WEB_CODE.html);
      setCssCode(DEFAULT_WEB_CODE.css);
      setJsCode(DEFAULT_WEB_CODE.javascript);
    } else {
      setSingleCode(DEFAULT_SNIPPETS[selectedLanguage] || '');
    }
    setCurrentSnippetId(null);
    setSnippetTitle('');
    setOutput('');
    setOutputError('');
    setExecutionTime(null);
    setHasUnsavedChanges(false);
  };

  const handleRunCode = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput('');
    setOutputError('');
    setExecutionTime(null);

    const startTime = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke('run-code', {
        body: { language: selectedLanguage, code: singleCode },
      });

      const elapsed = Date.now() - startTime;
      setExecutionTime(elapsed);

      if (error) {
        setOutputError(error.message || 'Execution failed');
      } else if (data.error) {
        setOutputError(data.error);
      } else {
        if (data.stderr && !data.output) {
          setOutputError(data.stderr);
        } else {
          setOutput(data.output || '(no output)');
          if (data.stderr) setOutputError(data.stderr);
        }
      }
    } catch (err: any) {
      setOutputError(err.message || 'Network error');
    } finally {
      setIsRunning(false);
    }
  };

  const handleQuickSave = async () => {
    if (!user) {
      toast({ title: 'ავტორიზაცია საჭიროა', description: 'კოდის შესანახად გაიარეთ ავტორიზაცია.', variant: 'destructive' });
      return;
    }

    // If already saved, update existing
    if (currentSnippetId && snippetTitle) {
      let success: boolean;
      if (selectedLanguage === 'web') {
        success = await updateSnippet(currentSnippetId, snippetTitle, htmlCode, cssCode, jsCode);
      } else {
        success = await updateSnippet(currentSnippetId, snippetTitle, '', '', singleCode);
      }
      if (success) {
        setHasUnsavedChanges(false);
      }
      return;
    }

    // If new, show save dialog
    setShowSaveDialog(true);
  };

  const handleSave = () => setShowSaveDialog(true);

  const handleSaveConfirm = async () => {
    if (!snippetTitle.trim()) {
      toast({ title: 'შეცდომა', description: 'გთხოვთ შეიყვანოთ სათაური.', variant: 'destructive' });
      return;
    }
    let snippetId: string | null;
    if (selectedLanguage === 'web') {
      snippetId = await saveSnippet(snippetTitle, htmlCode, cssCode, jsCode, 'web', hideCode, isPublic);
    } else {
      snippetId = await saveSnippet(snippetTitle, '', '', singleCode, selectedLanguage, hideCode, isPublic);
    }
    if (snippetId) {
      setCurrentSnippetId(snippetId);
      setHasUnsavedChanges(false);
      const link = `${window.location.origin}/code/${snippetId}`;
      setGeneratedLink(link);
      setShowSaveDialog(false);
      toast({ title: 'შენახულია!', description: 'კოდი წარმატებით შეინახა.' });
    }
  };

  const handleShare = () => {
    if (currentSnippetId) {
      const link = `${window.location.origin}/code/${currentSnippetId}`;
      setGeneratedLink(link);
      setShowShareDialog(true);
    } else {
      // Save first then share
      setShowSaveDialog(true);
    }
  };

  const handleSaveAndShare = async () => {
    if (!snippetTitle.trim()) {
      toast({ title: 'შეცდომა', description: 'გთხოვთ შეიყვანოთ სათაური.', variant: 'destructive' });
      return;
    }
    let snippetId: string | null;
    if (selectedLanguage === 'web') {
      snippetId = await saveSnippet(snippetTitle, htmlCode, cssCode, jsCode, 'web', hideCode, isPublic);
    } else {
      snippetId = await saveSnippet(snippetTitle, '', '', singleCode, selectedLanguage, hideCode, isPublic);
    }
    if (snippetId) {
      setCurrentSnippetId(snippetId);
      setHasUnsavedChanges(false);
      const link = `${window.location.origin}/code/${snippetId}`;
      setGeneratedLink(link);
      setShowSaveDialog(false);
      setShowShareDialog(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(generatedLink);
    toast({ title: 'დაკოპირდა!', description: 'ლინკი დაკოპირდა clipboard-ში.' });
  };

  const handleLanguageChange = (langId: string) => {
    setSelectedLanguage(langId);
    setShowLanguageSelector(false);
    setOutput('');
    setOutputError('');
    setExecutionTime(null);
    if (langId !== 'web') {
      setSingleCode(DEFAULT_SNIPPETS[langId] || '// Write your code here...');
    }
    // Reset current snippet when changing language
    setCurrentSnippetId(null);
    setSnippetTitle('');
    setHasUnsavedChanges(false);
  };

  const currentLang = LANGUAGE_MODES.find(l => l.id === selectedLanguage) || LANGUAGE_MODES[0];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ka-GE', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsFullscreen(false); };
    if (isFullscreen) document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isFullscreen]);

  return (
    <>
      <Atmosphere /><Header /><ChatWidget />
      
      {/* Fullscreen Preview */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
          <div className="flex items-center justify-between px-4 py-2 border-b" style={{ background: 'var(--bg-surface)', borderColor: 'var(--border-subtle)' }}>
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full" style={{ background: '#ff5f56' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#ffbd2e' }} />
                <div className="w-3 h-3 rounded-full" style={{ background: '#27c93f' }} />
              </div>
              <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>preview — {snippetTitle || 'Untitled'}</span>
            </div>
            <button onClick={() => setIsFullscreen(false)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all text-xs font-medium"
              style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}>
              <Minimize2 className="w-3.5 h-3.5" /> ESC
            </button>
          </div>
          <div className="flex-1 bg-white">
            <iframe srcDoc={getPreviewContent()} className="w-full h-full border-none" title="Fullscreen Preview" sandbox="allow-scripts" />
          </div>
        </div>
      )}

      <main style={{ paddingTop: '120px', paddingBottom: '40px', minHeight: '100vh' }}>
        <div className="container mx-auto px-4">
          {/* Header bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'var(--gold-glow)', border: '1px solid var(--border-accent)' }}>
                <span className="material-symbols-rounded text-xl" style={{ color: 'var(--gold)' }}>terminal</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                    {currentSnippetId ? snippetTitle || 'კოდის ედიტორი' : 'კოდის ედიტორი'}
                  </h1>
                  {currentSnippetId && hasUnsavedChanges && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="შეუნახავი ცვლილებები" />
                  )}
                </div>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                  {currentLang.name} • {currentLang.executable ? 'ლაივ გაშვება' : 'გაზიარება'}
                  {currentSnippetId && <span> • <span style={{ color: 'var(--gold)' }}>შენახული</span></span>}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Saved Projects Button */}
              <button className="relative inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all"
                style={{ background: showSavedPanel ? 'var(--gold-glow)' : 'var(--bg-elevated)', border: `1px solid ${showSavedPanel ? 'var(--border-accent)' : 'var(--border-subtle)'}`, color: showSavedPanel ? 'var(--gold-light)' : 'var(--text-secondary)' }}
                onClick={handleOpenSavedPanel}>
                <FolderOpen className="w-3.5 h-3.5" /> შენახული
                {savedSnippets.length > 0 && showSavedPanel && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{ background: 'var(--gold-glow)', color: 'var(--gold)' }}>{savedSnippets.length}</span>
                )}
              </button>
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium transition-all"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}
                onClick={handleReset}>
                <RotateCcw className="w-3.5 h-3.5" /> ახალი
              </button>
              {selectedLanguage !== 'web' && (
                <button
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  style={{ background: 'var(--gold)', color: 'white', boxShadow: 'var(--shadow-glow)' }}
                  onClick={handleRunCode}
                  disabled={isRunning}
                >
                  {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  {isRunning ? 'მუშაობს...' : 'გაშვება'}
                </button>
              )}
              {/* Save Button */}
              <button
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-accent)', color: 'var(--gold-light)' }}
                onClick={handleQuickSave}
                disabled={isLoading}
                title="Ctrl+S"
              >
                <Save className="w-3.5 h-3.5" />
                {isLoading ? 'ინახება...' : currentSnippetId ? 'განახლება' : 'შენახვა'}
              </button>
              {/* Share Button */}
              <button
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all"
                style={{ background: selectedLanguage === 'web' ? 'var(--gold)' : 'var(--bg-elevated)', color: selectedLanguage === 'web' ? 'white' : 'var(--text-primary)', border: selectedLanguage === 'web' ? 'none' : '1px solid var(--border-subtle)', boxShadow: selectedLanguage === 'web' ? 'var(--shadow-glow)' : 'none' }}
                onClick={handleShare}
              >
                <Share2 className="w-3.5 h-3.5" /> გაზიარება
              </button>
            </div>
          </div>

          {/* Saved Snippets Panel */}
          {showSavedPanel && (
            <div className="mb-4 rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" style={{ color: 'var(--gold)' }} />
                  <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>შენახული პროექტები</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link to="/my-projects" className="text-xs font-medium px-3 py-1 rounded-lg transition-all" style={{ color: 'var(--gold)', background: 'var(--gold-glow)' }}>
                    ყველა ნახვა
                  </Link>
                  <button onClick={() => setShowSavedPanel(false)} className="p-1 rounded-lg" style={{ color: 'var(--text-muted)' }}>
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="max-h-[280px] overflow-y-auto">
                {loadingSaved ? (
                  <div className="flex items-center justify-center py-8 gap-2" style={{ color: 'var(--text-muted)' }}>
                    <Loader2 className="w-4 h-4 animate-spin" /> იტვირთება...
                  </div>
                ) : savedSnippets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 gap-2">
                    <span className="material-symbols-rounded text-3xl" style={{ color: 'var(--text-dim)' }}>folder_off</span>
                    <p className="text-sm" style={{ color: 'var(--text-muted)' }}>შენახული პროექტები არ არის</p>
                  </div>
                ) : (
                  <div className="divide-y" style={{ borderColor: 'var(--border-subtle)' }}>
                    {savedSnippets.map((snippet) => {
                      const langInfo = LANGUAGE_MODES.find(l => l.id === snippet.language) || LANGUAGE_MODES[0];
                      const isActive = currentSnippetId === snippet.id;
                      return (
                        <div
                          key={snippet.id}
                          className={cn(
                            "flex items-center gap-4 px-5 py-3 transition-all cursor-pointer group",
                            isActive ? "bg-[var(--gold-glow)]" : "hover:bg-[var(--bg-hover)]"
                          )}
                          onClick={() => handleLoadSnippet(snippet.id)}
                        >
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: `${langInfo.color}20`, border: `1px solid ${langInfo.color}40` }}>
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background: langInfo.color }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate" style={{ color: isActive ? 'var(--gold-light)' : 'var(--text-primary)' }}>
                              {snippet.title}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>{langInfo.name}</span>
                              <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>•</span>
                              <span className="text-[10px] flex items-center gap-1" style={{ color: 'var(--text-dim)' }}>
                                <Clock className="w-2.5 h-2.5" />
                                {formatDate(snippet.updated_at)}
                              </span>
                              {snippet.is_public && (
                                <>
                                  <span className="text-[10px]" style={{ color: 'var(--text-dim)' }}>•</span>
                                  <span className="text-[10px]" style={{ color: '#34d399' }}>საჯარო</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => { e.stopPropagation(); handleDeleteSnippet(snippet.id); }}
                              className="p-1.5 rounded-lg transition-all hover:bg-red-500/10"
                              style={{ color: 'var(--text-dim)' }}
                              title="წაშლა"
                            >
                              <Trash2 className="w-3.5 h-3.5 hover:text-red-400" />
                            </button>
                          </div>
                          {isActive && (
                            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: 'var(--gold)' }} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Language Selector */}
          <div className="relative mb-4">
            <button
              className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)' }}
              onClick={() => setShowLanguageSelector(!showLanguageSelector)}
            >
              <div className="w-3 h-3 rounded-full" style={{ background: currentLang.color }} />
              <span>{currentLang.name}</span>
              <span className="text-xs font-normal" style={{ color: 'var(--text-muted)' }}>({currentLang.description})</span>
              <svg className={`w-3.5 h-3.5 transition-transform ${showLanguageSelector ? 'rotate-180' : ''}`} style={{ color: 'var(--text-muted)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>

            {showLanguageSelector && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLanguageSelector(false)} />
                <div className="absolute top-full left-0 z-50 mt-2 py-1.5 rounded-xl w-[320px] max-h-[420px] overflow-y-auto"
                  style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', boxShadow: 'var(--shadow-xl)' }}>
                  {LANGUAGE_MODES.map((lang) => (
                    <button
                      key={lang.id}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all ${selectedLanguage === lang.id ? 'bg-[var(--gold-glow)]' : 'hover:bg-[var(--bg-hover)]'}`}
                      onClick={() => handleLanguageChange(lang.id)}
                    >
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: lang.color }} />
                      <span className="font-medium flex-1 text-left" style={{ color: selectedLanguage === lang.id ? 'var(--gold-light)' : 'var(--text-primary)' }}>{lang.name}</span>
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{lang.description}</span>
                      {lang.executable && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold" style={{ background: 'rgba(52,211,153,0.15)', color: '#34d399' }}>LIVE</span>
                      )}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Editor + Preview/Output */}
          <div className="grid gap-3" style={{
            gridTemplateColumns: selectedLanguage === 'web' ? '1fr 1fr' : '1fr 1fr',
            height: 'calc(100vh - 300px)',
            minHeight: '500px'
          }}>
            {selectedLanguage === 'web' ? (
              <>
                {/* Web Editor Panel */}
                <div className="flex flex-col rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                    {(['html', 'css', 'javascript'] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveTab(lang)}
                        className="relative flex items-center gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-wider transition-all"
                        style={{ color: activeTab === lang ? 'var(--text-primary)' : 'var(--text-muted)', background: activeTab === lang ? 'var(--bg-card)' : 'transparent' }}
                      >
                        <div className={`w-2 h-2 rounded-full ${lang === 'html' ? 'bg-orange-500' : lang === 'css' ? 'bg-blue-500' : 'bg-yellow-500'}`} />
                        {lang === 'javascript' ? 'JS' : lang.toUpperCase()}
                        {activeTab === lang && <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: 'var(--gold)' }} />}
                      </button>
                    ))}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <CodeEditor
                      value={activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode}
                      onChange={(value) => {
                        if (activeTab === 'html') setHtmlCode(value);
                        else if (activeTab === 'css') setCssCode(value);
                        else setJsCode(value);
                      }}
                      language={activeTab}
                      placeholder={`დაწერე ${activeTab.toUpperCase()} კოდი აქ...`}
                    />
                  </div>
                </div>

                {/* Web Preview Panel */}
                <div className="flex flex-col rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f56' }} />
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ffbd2e' }} />
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#27c93f' }} />
                      </div>
                      <span className="text-xs font-mono" style={{ color: 'var(--text-muted)' }}>პრევიუ</span>
                    </div>
                    <button onClick={() => setIsFullscreen(true)}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs"
                      style={{ color: 'var(--text-muted)' }}>
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex-1 bg-white">
                    <iframe srcDoc={getPreviewContent()} className="w-full h-full border-none" title="Code Preview" sandbox="allow-scripts" />
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Single Language Editor */}
                <div className="flex flex-col rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: currentLang.color }} />
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>{currentLang.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      {currentSnippetId && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md" style={{ background: 'var(--gold-glow)', color: 'var(--gold)' }}>
                          შენახული
                        </span>
                      )}
                      <span className="text-[10px] font-mono" style={{ color: 'var(--text-dim)' }}>
                        {singleCode.split('\n').length} ხაზი
                      </span>
                    </div>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <CodeEditor
                      value={singleCode}
                      onChange={setSingleCode}
                      language={selectedLanguage}
                      placeholder={`დაწერე ${currentLang.name} კოდი აქ...`}
                    />
                  </div>
                </div>

                {/* Output Panel */}
                <div className="flex flex-col rounded-2xl overflow-hidden" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-elevated)' }}>
                    <div className="flex items-center gap-3">
                      <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ff5f56' }} />
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ffbd2e' }} />
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#27c93f' }} />
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-secondary)' }}>
                        <span className="material-symbols-rounded text-xs align-middle mr-1" style={{ color: 'var(--gold)' }}>terminal</span>
                        აუთფუთი
                      </span>
                    </div>
                    {executionTime !== null && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-md" style={{ background: 'var(--gold-glow)', color: 'var(--gold-light)' }}>
                        {executionTime}ms
                      </span>
                    )}
                  </div>
                  <div className="flex-1 overflow-auto p-5 font-mono text-sm" style={{ background: '#0a0a0f' }}>
                    {isRunning ? (
                      <div className="flex items-center gap-3 py-4" style={{ color: 'var(--gold-light)' }}>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">კოდი მუშავდება...</span>
                      </div>
                    ) : output || outputError ? (
                      <div className="space-y-3">
                        {output && (
                          <pre className="whitespace-pre-wrap leading-relaxed" style={{ color: '#e6e6e6' }}>{output}</pre>
                        )}
                        {outputError && (
                          <pre className="whitespace-pre-wrap leading-relaxed" style={{ color: '#f87171' }}>{outputError}</pre>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
                          <span className="material-symbols-rounded text-3xl" style={{ color: 'var(--text-dim)' }}>play_circle</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)' }}>გაშვება</p>
                          <p className="text-xs" style={{ color: 'var(--text-dim)' }}>
                            დააჭირე <span className="font-semibold" style={{ color: 'var(--gold)' }}>გაშვება</span> ღილაკს კოდის შესასრულებლად
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Save Dialog */}
      <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>კოდის შენახვა</DialogTitle>
            <DialogDescription>შეინახე შენი {currentLang.name} კოდი.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">პროექტის სახელი</label>
              <Input value={snippetTitle} onChange={(e) => setSnippetTitle(e.target.value)} placeholder="მაგ: ჩემი პირველი პროექტი" />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setIsPublic(!isPublic)} className={cn("w-10 h-6 rounded-full relative transition-colors", isPublic ? "bg-primary" : "bg-muted")}>
                <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform", isPublic ? "translate-x-5" : "translate-x-1")} />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">საჯარო გალერეაში</span>
                <p className="text-xs text-muted-foreground">ჩართვის შემთხვევაში სხვები ნახავენ</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <div onClick={() => setHideCode(!hideCode)} className={cn("w-10 h-6 rounded-full relative transition-colors", hideCode ? "bg-primary" : "bg-muted")}>
                <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform", hideCode ? "translate-x-5" : "translate-x-1")} />
              </div>
              <div>
                <span className="text-sm font-medium text-foreground">კოდის დაფარვა</span>
                <p className="text-xs text-muted-foreground">სხვები ვერ ნახავენ კოდს</p>
              </div>
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowSaveDialog(false)}>გაუქმება</Button>
              <Button onClick={handleSaveConfirm} disabled={isLoading}>
                <Save className="w-4 h-4 mr-1" />
                {isLoading ? 'ინახება...' : 'შენახვა'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="material-symbols-rounded" style={{ fontSize: '22px', color: '#34d399' }}>check_circle</span>
              გაზიარების ლინკი
            </DialogTitle>
            <DialogDescription>გააზიარე ეს ლინკი</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-2">
            <div className="flex gap-2">
              <Input value={generatedLink} readOnly className="font-mono text-xs" />
              <Button onClick={handleCopyLink} size="sm">
                <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>content_copy</span>
                კოპირება
              </Button>
            </div>
            <Link to={generatedLink.replace(window.location.origin, '')} target="_blank"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
              <span className="material-symbols-rounded" style={{ fontSize: '16px' }}>open_in_new</span>
              გახსნა ახალ ტაბში
            </Link>
          </div>
        </DialogContent>
      </Dialog>

      <style>{`
        @media (max-width: 768px) {
          .grid[style] {
            grid-template-columns: 1fr !important;
            height: auto !important;
            min-height: auto !important;
          }
          .grid[style] > div {
            height: 400px;
          }
        }
      `}</style>
    </>
  );
};

export default Playground;
