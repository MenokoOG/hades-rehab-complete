# Minimal evaluation harness: load checkpoint and run test inputs
import argparse
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--checkpoint', required=True, help='path to model/LoRA checkpoint')
    parser.add_argument('--input_file', required=True, help='newline-delimited inputs')
    args = parser.parse_args()

    tokenizer = AutoTokenizer.from_pretrained(args.checkpoint)
    model = AutoModelForCausalLM.from_pretrained(args.checkpoint, device_map='auto')
    gen = pipeline('text-generation', model=model, tokenizer=tokenizer, device=0)

    with open(args.input_file, 'r') as f:
        lines = [l.strip() for l in f if l.strip()]
    for l in lines:
        out = gen(l, max_new_tokens=128)[0]['generated_text']
        print('INPUT:', l)
        print('OUTPUT:', out)
        print('---')

if __name__ == '__main__':
    main()
