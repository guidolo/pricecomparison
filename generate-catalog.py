#!/usr/bin/env python3
import os
import json
import re
from pathlib import Path

# Paths to the files
API_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'api')
PRODUCTS_DIR = os.path.join(API_DIR, 'products')
OFFERS_DIR = os.path.join(API_DIR, 'offers')
CONSOLIDATED_FILE_PATTERN = re.compile(r'\.json$')
PRODUCT_CATALOG_FILE = os.path.join(API_DIR, 'product-catalog.json')

# Function to get all consolidated files
def get_consolidated_files():
    if not os.path.exists(PRODUCTS_DIR):
        print(f"Products directory not found: {PRODUCTS_DIR}")
        return []
    return [os.path.join(PRODUCTS_DIR, f) for f in os.listdir(PRODUCTS_DIR) 
            if CONSOLIDATED_FILE_PATTERN.search(f)]

# Function to get all offers files
def get_offers_files():
    if not os.path.exists(OFFERS_DIR):
        print(f"Offers directory not found: {OFFERS_DIR}")
        return []
    return [os.path.join(OFFERS_DIR, f) for f in os.listdir(OFFERS_DIR) 
            if f.endswith('.json')]

# Function to extract product ID from filename
def extract_product_id_from_filename(filename):
    basename = os.path.basename(filename).replace('.json', '')
    return basename

# Function to normalize product ID for comparison
def normalize_product_id(product_id):
    # Convert dashes to underscores and vice versa for comparison
    normalized = product_id.replace('-', '_').replace(' ', '_').lower()
    
    # Handle special case for iphone14-pro-max vs iphone_14_pro_max
    if 'iphone' in normalized:
        normalized = normalized.replace('iphone14_', 'iphone_14_')
        normalized = normalized.replace('iphone14-', 'iphone_14_')
    
    return normalized

# Function to get lowest price from offers
def get_lowest_price(offers):
    if not offers or len(offers) == 0:
        return 0
    
    # Debug information
    print(f"Found {len(offers)} offers with prices: {[offer.get('price', 'N/A') for offer in offers]}")
    
    # Make sure we only consider offers with valid prices
    valid_prices = []
    for offer in offers:
        if 'price' in offer and isinstance(offer['price'], (int, float)) and offer['price'] > 0:
            valid_prices.append(offer['price'])
    
    if not valid_prices:
        print("  No valid prices found in offers")
        return 0
    
    min_price = min(valid_prices)
    print(f"  Minimum price found: {min_price}")
    return min_price

# Function to get offer count
def get_offer_count(offers):
    if not offers:
        return 0
    return len(offers)

# Function to extract unique variants from offers
def extract_variants(offers):
    if not offers or len(offers) == 0:
        return []
    
    unique_variants = set()
    
    for offer in offers:
        if 'variant_id' in offer:
            unique_variants.add(offer['variant_id'])
    
    return list(unique_variants)

# Function to generate product catalog
def generate_product_catalog():
    consolidated_files = get_consolidated_files()
    offers_files = get_offers_files()
    
    print(f"Found {len(consolidated_files)} consolidated files in {PRODUCTS_DIR}")
    print(f"Found {len(offers_files)} offers files in {OFFERS_DIR}")
    
    products = []
    
    # Process each consolidated file
    for consolidated_file in consolidated_files:
        product_id = extract_product_id_from_filename(consolidated_file)
        
        with open(consolidated_file, 'r', encoding='utf-8') as f:
            consolidated_data = json.load(f)
        
        # Find corresponding offers file
        offers_file = None
        
        print(f"Looking for offers file for product ID: {product_id}")
        
        # Look for the offers file with the same product ID
        for file in offers_files:
            file_basename = os.path.basename(file)
            offers_product_id = extract_product_id_from_filename(file)
            
            print(f"  Checking file: {file_basename} (extracted ID: {offers_product_id})")
            
            # Check if the product IDs match
            if product_id == offers_product_id:
                offers_file = file
                print(f"  Found matching offers file: {file_basename}")
                break
        
        offers = []
        if offers_file:
            try:
                with open(offers_file, 'r', encoding='utf-8') as f:
                    offers_data = json.load(f)
                    offers = offers_data.get('offers', [])
                    print(f"  Loaded {len(offers)} offers from {os.path.basename(offers_file)}")
            except Exception as e:
                print(f"  Error loading offers file: {str(e)}")
        else:
            print("  No matching offers file found")
        
        # Extract product information
        product = consolidated_data.get('product', {})
        
        # Get the first image as the main product image
        main_image = ''
        if 'images' in product and len(product['images']) > 0:
            main_image = product['images'][0].get('url', '')
        
        # Get price and offer count
        min_price = get_lowest_price(offers)
        offer_count = get_offer_count(offers)
        
        # Create product entry for catalog
        product_entry = {
            'id': product_id,
            'name': product.get('name', ''),
            'category': product.get('category', 'Smartphones'),
            'image': main_image,
            'description': product.get('description', ''),
            'price_from': min_price,
            'offer_count': offer_count
            # Removed variants field as requested
        }
        
        products.append(product_entry)
    
    # Create the catalog object
    catalog = {
        'products': products
    }
    
    # Write to file
    with open(PRODUCT_CATALOG_FILE, 'w', encoding='utf-8') as f:
        json.dump(catalog, f, indent=2, ensure_ascii=False)
    
    print(f'Product catalog generated at: {PRODUCT_CATALOG_FILE}')
    print(f'Processed {len(products)} products')

# Execute the function
if __name__ == '__main__':
    generate_product_catalog()
