# Drinks Database Schema Documentation

This document outlines the schema for drink entries in the Half-Life Caffeine Tracker database.

## JSON Schema

Each drink in the database should follow this structure:

```json
{
  "brand": "String (required)",
  "product": "String (required)",
  "category": "String (required)",
  "caffeine_mg_per_oz": Number (required),
  "default_size_in_oz": Number (required),
  "labels": ["Array of strings (optional)"],
  "user_entered": Boolean (optional)
}
```

## Field Descriptions

### Required Fields

- **brand**: The company or brand that produces the drink (previously called "manufacturer")
- **product**: The specific product name
- **category**: The type of drink (e.g., coffee, tea, energy_drink, soft_drink)
- **caffeine_mg_per_oz**: The caffeine content concentration in milligrams per fluid ounce
- **default_size_in_oz**: The default serving size in fluid ounces

### Optional Fields

- **labels**: Tags that help categorize and filter the drink, each starting with # (e.g., ["#coffee", "#brewed"])
- **user_entered**: Boolean flag indicating if this is a custom drink entered by the user
- **id**: String identifier, required only for custom user-entered drinks

## Example Entry

```json
{
  "brand": "Starbucks",
  "product": "Pike Place Roast Coffee",
  "category": "coffee",
  "caffeine_mg_per_oz": 19.375,
  "default_size_in_oz": 16,
  "labels": ["#coffee", "#brewed"]
}
```

## Custom User-Entered Drink Example

```json
{
  "id": "12345-uuid",
  "brand": "Local Coffee Shop",
  "product": "House Blend",
  "category": "coffee",
  "caffeine_mg_per_oz": 18.0,
  "default_size_in_oz": 12,
  "labels": ["#coffee", "#custom"],
  "user_entered": true
}
```

## Common Categories

- **coffee**: Coffee and coffee-based drinks
- **tea**: Tea and tea-based drinks
- **energy_drink**: Energy drinks like Red Bull, Monster, etc.
- **soft_drink**: Sodas and other carbonated beverages
- **supplement**: Caffeine pills, powders, etc.
- **other**: Other caffeinated products

## Guidelines for Contributors

When adding new drinks or updating existing ones:

1. Always verify caffeine content from reliable sources
2. Calculate the caffeine_mg_per_oz value correctly (total caffeine ÷ volume)
3. Include appropriate default serving size
4. Format labels consistently (lowercase, hyphenated multi-word tags)
5. Use standard categories for easy filtering
6. Check for duplicates before adding new entries

Your contributions help make this database more accurate and comprehensive!