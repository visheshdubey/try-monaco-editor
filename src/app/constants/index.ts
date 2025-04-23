import { Language, Problem } from "../types";

export const SUPPORTED_LANGUAGES: Language[] = [
  { id: 63, name: "JavaScript", value: "javascript" },
  { id: 50, name: "C", value: "c" },
  { id: 54, name: "C++", value: "cpp" },
  { id: 62, name: "Java", value: "java" },
  { id: 71, name: "Python", value: "python" },
];

export const INITIAL_PROBLEM: Problem = {
  id: "1",
  title: "Two Sum",
  description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
  constraints: [
    "2 <= nums.length <= 10^4",
    "-10^9 <= nums[i] <= 10^9",
    "-10^9 <= target <= 10^9",
    "Only one valid answer exists.",
  ],
  initialCode: {
    javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
var twoSum = function(nums, target) {
    // Your code here
};`,
    c: `/**
 * Note: The returned array must be malloced, assume caller calls free().
 */
int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    // Your code here
}`,
    cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Your code here
    }
};`,
    java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
    }
}`,
    python: `class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        # Your code here`,
  },
};
