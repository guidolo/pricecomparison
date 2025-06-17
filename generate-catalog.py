#!/usr/bin/env python3
import os
import json
import re
from pathlib import Path

# Paths to the files
API_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'api')
CONSOLIDATED_FILE_PATTERN = re.compile(r'_consolidated\.json$')
OFFERS_FILE_PATTERN = re.compile(r'^offers-.*\.json$')
PRODUCT_CATALOG_FILE = os.path.join(API_DIR, 'product-catalog.json')

# Function to get all consolidated files
def get_consolidated_files():
    return [os.path.join(API_DIR, f) for f in os.listdir(API_DIR) 
            if CONSOLIDATED_FILE_PATTERN.search(f)]

# Function to get all offers files
def get_offers_files():
    return [os.path.join(API_DIR, f) for f in os.listdir(API_DIR) 
            if OFFERS_FILE_PATTERN.search(f)]

# Function to extract product ID from filename
def extract_product_id_from_filename(filename):
    basename = os.path.basename(filename).replace('.json', '')
    if '_consolidated' in basename:
        return basename.replace('_consolidated', '')
    elif basename.startswith('offers-'):
        return basename.replace('offers-', '')
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
    valid_prices = [offer.get('price', float('inf')) for offer in offers if 'price' in offer]
    if not valid_prices:
        return 0
    
    return min(valid_prices)

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
    
    products = []
    
    # Process each consolidated file
    for consolidated_file in consolidated_files:
        product_id = extract_product_id_from_filename(consolidated_file)
        
        with open(consolidated_file, 'r', encoding='utf-8') as f:
            consolidated_data = json.load(f)
        
        # Find corresponding offers file
        offers_file = None
        normalized_product_id = normalize_product_id(product_id)
        
        print(f"Looking for offers file for product ID: {product_id} (normalized: {normalized_product_id})")
        
        # Based on the memory about the project, we know there's a discrepancy between IDs
        # Direct mapping for the known case
        if product_id == 'iphone_14_pro_max':
            for file in offers_files:
                if 'iphone14-pro_max' in file or 'iphone14-pro-max' in file:
                    offers_file = file
                    print(f"  Found matching offers file using direct mapping: {os.path.basename(file)}")
                    break
        
        # If direct mapping didn't work, try the normalized approach
        if not offers_file:
            for file in offers_files:
                file_basename = os.path.basename(file)
                offers_product_id = normalize_product_id(extract_product_id_from_filename(file))
                print(f"  Checking file: {file_basename} (extracted ID: {offers_product_id})")
                
                # Check if the normalized product IDs match
                if normalized_product_id == offers_product_id or \
                   normalized_product_id in offers_product_id or \
                   offers_product_id in normalized_product_id:
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
        
        # Create product entry for catalog
        product_entry = {
            'id': product_id,
            'name': product.get('name', ''),
            'category': product.get('category', 'Smartphones'),
            'image': main_image,
            'description': product.get('description', ''),
            'price_from': get_lowest_price(offers)
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
