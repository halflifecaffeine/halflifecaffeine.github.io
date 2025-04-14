# Drinks Database Schema Documentation

This document outlines the schema for drink entries in the Half-Life Caffeine Tracker database.

## JSON Schema

Each drink in the database should follow this structure:

```json
{
  "manufacturer": "String (required)",
  "product": "String (required)",
  "category": "String (required)",
  "volume_oz": Number (required),
  "caffeine_mg": Number (required),
  "labels": ["Array of strings (required)"],
  "source_url": "String (optional)",
  "source_type": "String (optional)"
}
```

## Field Descriptions

### Required Fields

- **manufacturer**: The company or brand that produces the drink
- **product**: The specific product name
- **category**: The type of drink (e.g., coffee, tea, energy_drink, soft_drink)
- **volume_oz**: The volume in fluid ounces (can be converted from ml if needed)
- **caffeine_mg**: The caffeine content in milligrams
- **labels**: Tags that help categorize and filter the drink, each starting with # (e.g., ["#coffee", "#brewed"])

### Optional Fields

- **source_url**: URL to the source of information about caffeine content
- **source_type**: The type of source (e.g., "official", "publication", "database", "other")

## Example Entry

```json
{
  "manufacturer": "Starbucks",
  "product": "Pike Place Roast Coffee",
  "category": "coffee",
  "volume_oz": 16,
  "caffeine_mg": 310,
  "labels": ["#coffee", "#brewed"],
  "source_url": "https://www.starbucks.com/menu/product/410/hot",
  "source_type": "official"
}
```

## Notes on Source Types

- **official**: Information directly from the manufacturer's website or official publications
- **publication**: Academic or scientific publications
- **database**: Government or independent testing databases
- **other**: Other sources (please specify in pull request description)

## Guidelines for Contributors

When adding new drinks or updating existing ones:

1. Always verify caffeine content from reliable sources
2. Include source URLs whenever possible
3. Format labels consistently (lowercase, hyphenated multi-word tags)
4. Use standard categories for easy filtering
5. Check for duplicates before adding new entries

Your contributions help make this database more accurate and comprehensive!