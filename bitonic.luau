--!strict

local function bitonicXorSort(list: {number}, ascending: boolean)
    local n = #list
    -- If n is already a power of two, we’ll go exactly up to n.
    -- Otherwise, we go up to the next power of two, but skip out-of-range comparisons.
    local maxPow = 1
    while maxPow < n do
        maxPow = maxPow * 2  -- Double until >= n
    end

    -- Outer loop: k goes from 2 up to maxPow in powers of two.
    local k = 2
    while k <= maxPow do
        -- Inner loop: j goes from k/2 down to 1 in powers of two.
        local j = k / 2
        while j > 0 do
            -- For each i in [0..n-1], compare i with ixj = i ^ j
            for i = 0, n - 1 do
                local ixj = bit32.bxor(i, j)  -- bitwise XOR
                -- Make sure ixj is in range and that we only handle (i < ixj) once
                if ixj > i and ixj < n then
                    -- Check if we are "ascending" or "descending" in this block
                    local up = bit32.band(i, k) == 0  -- Standard bitonic direction
                    -- If the user wants the entire final array descending, flip direction
                    if not ascending then
                        up = not up
                    end

                    -- Indices in Lua are 1-based, hence +1
                    local aIndex = i + 1
                    local bIndex = ixj + 1

                    -- Compare and swap if out of order
                    if (up and list[aIndex] > list[bIndex]) or (not up and list[aIndex] < list[bIndex]) then
                        list[aIndex], list[bIndex] = list[bIndex], list[aIndex]
                    end
                end
            end
            j = j / 2
        end
        k = k * 2
    end
end

-- Demo
local function renderList(list: {number})
    print(table.concat(list, ", "))
end

local test = {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18}
renderList(test)
bitonicXorSort(test, false) -- sort descending
renderList(test)
