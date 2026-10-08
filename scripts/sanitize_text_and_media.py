#!/usr/bin/env python3
"""
Autonomous Sanitization Engine (Text, Image & PDF)
Implements Maverick AI De-Watermarking & Anti-Slop Discipline
Layer A (Zero-Width & Bidi Unicode), Voice Alignment, and Layer C (EXIF/C2PA Metadata Stripping).
"""

import sys
import os
import re
import argparse
from pathlib import Path
from PIL import Image

# 1. Regex for Layer A Invisible Unicode characters
INVISIBLE_CHARS_PATTERN = re.compile(
    r'[\u200B-\u200D\u2060\uFEFF\u00A0\u202A-\u202E\u200E\u200F]'
)

# 2. Heuristic Banned AI Slop Words & Buzzwords (aligned with voice.md)
BANNED_BUZZWORDS = [
    r'\bdelve\b',
    r'\bleverage\b',
    r'\brobust\b',
    r'\bseamless\b',
    r'\bgame-changer\b',
    r'\bsynergy\b',
    r'\bdisrupt\b',
    r'\bpassionate about\b',
    r'\bthought leader\b',
    r'\bin today\'s fast-paced world\b',
    r'\blet that sink in\b',
    r'\btestament to\b',
    r'\bbespoke\b',
    r'\btapestry\b',
    r'\bnavigating the\b',
    r'\bfoster\b',
    r'\bunlock the power of\b'
]
SLOP_REGEX = re.compile('|'.join(BANNED_BUZZWORDS), re.IGNORECASE)

def sanitize_text(text: str) -> tuple[str, dict]:
    """Strips invisible characters, normalizes dashes, and flags slop words."""
    stats = {
        'invisible_chars_removed': 0,
        'em_dashes_normalized': 0,
        'slop_matches_found': []
    }
    
    # Count & remove invisible characters
    matches = INVISIBLE_CHARS_PATTERN.findall(text)
    stats['invisible_chars_removed'] = len(matches)
    cleaned = INVISIBLE_CHARS_PATTERN.sub('', text)
    
    # Count & normalize excessive em dashes to clean spaced hyphens or periods
    em_dash_count = cleaned.count('—')
    stats['em_dashes_normalized'] = em_dash_count
    cleaned = cleaned.replace('—', ' - ')
    cleaned = re.sub(r' +', ' ', cleaned)
    
    # Check for AI slop matches
    slop_matches = SLOP_REGEX.findall(cleaned)
    stats['slop_matches_found'] = list(set(m.lower() for m in slop_matches))
    
    return cleaned, stats

def sanitize_image(image_path: str, output_path: str = None) -> bool:
    """Strips all EXIF, XMP, and C2PA metadata from image by re-encoding pixel buffer."""
    in_p = Path(image_path)
    out_p = Path(output_path) if output_path else in_p
    
    try:
        with Image.open(in_p) as img:
            data = list(img.getdata())
            clean_img = Image.new(img.mode, img.size)
            clean_img.putdata(data)
            clean_img.save(out_p, quality=95, optimize=True)
        return True
    except Exception as e:
        print(f"Error sanitizing image {image_path}: {e}", file=sys.stderr)
        return False

def sanitize_pdf(pdf_path: str, output_path: str = None) -> bool:
    """Strips /Metadata, /PieceInfo, /Creator, /Producer from PDF file safely using pure bytes manipulation."""
    in_p = Path(pdf_path)
    out_p = Path(output_path) if output_path else in_p
    
    try:
        with open(in_p, 'rb') as f:
            content = f.read()
            
        # Strip XMP Metadata xml packet if present: <?xpacket ... </?xpacket>
        xmp_pattern = re.compile(b'<\\?xpacket begin=.*?<\\?xpacket end=.*?>', re.DOTALL)
        content = xmp_pattern.sub(b'', content)
        
        # Strip C2PA assertions if present
        c2pa_pattern = re.compile(b'/C2PA.*?>>', re.DOTALL)
        content = c2pa_pattern.sub(b'', content)
        
        # Zero out typical Producer and Creator metadata strings
        content = re.sub(b'/Creator\\s*\\([^)]*\\)', b'/Creator ()', content)
        content = re.sub(b'/Producer\\s*\\([^)]*\\)', b'/Producer ()', content)
        content = re.sub(b'/Author\\s*\\([^)]*\\)', b'/Author ()', content)
        
        with open(out_p, 'wb') as f:
            f.write(content)
        return True
    except Exception as e:
        print(f"Error sanitizing PDF {pdf_path}: {e}", file=sys.stderr)
        return False

def main():
    parser = argparse.ArgumentParser(description="Autonomous Sanitization & Anti-Slop Engine")
    subparsers = parser.add_subparsers(dest="command", required=True)
    
    # Text command
    p_text = subparsers.add_parser("text", help="Sanitize a raw string from stdin or argument")
    p_text.add_argument("content", nargs="?", help="Text string to sanitize")
    
    # File command
    p_file = subparsers.add_parser("file", help="Sanitize a text/markdown file in place or to target")
    p_file.add_argument("path", help="Path to text or markdown file")
    p_file.add_argument("-o", "--output", help="Optional output path")
    
    # Image command
    p_img = subparsers.add_parser("image", help="Strip metadata from an image (PNG/JPEG)")
    p_img.add_argument("path", help="Path to image file")
    p_img.add_argument("-o", "--output", help="Optional output path")
    
    # PDF command
    p_pdf = subparsers.add_parser("pdf", help="Strip metadata from a PDF file")
    p_pdf.add_argument("path", help="Path to PDF file")
    p_pdf.add_argument("-o", "--output", help="Optional output path")
    
    args = parser.parse_args()
    
    if args.command == "text":
        raw = args.content if args.content else sys.stdin.read()
        cleaned, stats = sanitize_text(raw)
        print(cleaned)
        if stats['slop_matches_found']:
            print(f"\n[ALERT] Detected Banned AI Slop Words: {', '.join(stats['slop_matches_found'])}", file=sys.stderr)
        if stats['invisible_chars_removed']:
            print(f"[CLEANED] Stripped {stats['invisible_chars_removed']} invisible characters.", file=sys.stderr)
            
    elif args.command == "file":
        with open(args.path, 'r', encoding='utf-8') as f:
            content = f.read()
        cleaned, stats = sanitize_text(content)
        target = args.output if args.output else args.path
        with open(target, 'w', encoding='utf-8') as f:
            f.write(cleaned)
        print(f"File sanitized: {target}")
        print(f"Removed {stats['invisible_chars_removed']} invisible characters, {stats['em_dashes_normalized']} em dashes.")
        if stats['slop_matches_found']:
            print(f"Warnings for slop words: {stats['slop_matches_found']}")
            
    elif args.command == "image":
        if sanitize_image(args.path, args.output):
            print(f"Image sanitized and EXIF stripped: {args.output or args.path}")
            
    elif args.command == "pdf":
        if sanitize_pdf(args.path, args.output):
            print(f"PDF sanitized and C2PA/Metadata stripped: {args.output or args.path}")

if __name__ == "__main__":
    main()
