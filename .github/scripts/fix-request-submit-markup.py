from pathlib import Path

path = Path('.source/peace-love-app-source/src/components/RequestView.tsx')
text = path.read_text()
old = '''              </div>
              </div>
            </div>

          </form>'''
new = '''              </div>
            </div>

          </form>'''
count = text.count(old)
if count != 1:
    raise RuntimeError(f'RequestView generated closing boundary: expected one match, found {count}')
path.write_text(text.replace(old, new, 1))
